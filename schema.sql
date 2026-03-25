-- TaskFlow Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- 
-- IMPORTANT: The tables need to be created manually via Supabase Dashboard
-- because the subagent cannot execute DDL statements directly.

-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Run this entire script

-- =====================================================
-- PROFILES (extends auth.users)
-- =====================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT DEFAULT '',
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  theme TEXT DEFAULT 'light',
  karma INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROJECTS
-- =====================================================
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8B5CF6',
  icon TEXT DEFAULT '📁',
  is_archived BOOLEAN DEFAULT FALSE,
  view_style TEXT DEFAULT 'list',
  parent_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with_emails JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTIONS
-- =====================================================
CREATE TABLE sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TASKS (3-layer hierarchy)
-- =====================================================
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  grandparent_id UUID,
  content TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date TIMESTAMPTZ,
  due_string TEXT,
  priority INTEGER DEFAULT 3,
  is_completed BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  layer INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- LABELS
-- =====================================================
CREATE TABLE labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8B5CF6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TASK_LABELS (junction table)
-- =====================================================
CREATE TABLE task_labels (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- =====================================================
-- REMINDERS
-- =====================================================
CREATE TABLE reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trigger_at TIMESTAMPTZ NOT NULL,
  type TEXT DEFAULT 'absolute',
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMENTS
-- =====================================================
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FILTERS
-- =====================================================
CREATE TABLE filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  color TEXT DEFAULT '#8B5CF6',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RECURRING_TEMPLATES
-- =====================================================
CREATE TABLE recurring_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rule TEXT NOT NULL,
  next_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- profiles: users can only see/edit their own
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- projects: users own their projects
CREATE POLICY "projects_own" ON projects FOR ALL USING (auth.uid() = user_id);

-- sections: users own their sections via project
CREATE POLICY "sections_own" ON sections FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = sections.project_id AND projects.user_id = auth.uid())
);

-- tasks: users own their tasks
CREATE POLICY "tasks_own" ON tasks FOR ALL USING (auth.uid() = user_id);

-- labels: users own their labels
CREATE POLICY "labels_own" ON labels FOR ALL USING (auth.uid() = user_id);

-- task_labels: via labels ownership
CREATE POLICY "task_labels_own" ON task_labels FOR ALL USING (
  EXISTS (SELECT 1 FROM labels WHERE labels.id = task_labels.label_id AND labels.user_id = auth.uid())
);

-- reminders: users own their reminders
CREATE POLICY "reminders_own" ON reminders FOR ALL USING (auth.uid() = user_id);

-- comments: via tasks
CREATE POLICY "comments_own" ON comments FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = comments.task_id AND tasks.user_id = auth.uid())
);

-- filters: users own their filters
CREATE POLICY "filters_own" ON filters FOR ALL USING (auth.uid() = user_id);

-- recurring_templates: via task ownership
CREATE POLICY "recurring_own" ON recurring_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = recurring_templates.task_id AND tasks.user_id = auth.uid())
);

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STORAGE BUCKET FOR ATTACHMENTS
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);
CREATE POLICY "attachments_own" ON storage.objects FOR ALL USING (auth.uid()::text = owner_id);
