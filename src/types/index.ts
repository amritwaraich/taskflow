export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  subscription_tier: 'free' | 'pro'
  subscription_status: 'active' | 'canceled' | 'past_due'
  stripe_customer_id: string | null
  theme: 'light' | 'dark' | 'system'
  karma: number
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  is_archived: boolean
  view_style: 'list' | 'board'
  parent_project_id: string | null
  is_shared: boolean
  shared_with_emails: string[]
  created_at: string
  updated_at?: string
  position?: number
}

export interface Section {
  id: string
  project_id: string
  name: string
  position: number
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  project_id: string | null
  section_id: string | null
  parent_id: string | null
  grandparent_id: string | null
  content: string
  description: string | null
  due_date: string | null
  due_string: string | null
  priority: 1 | 2 | 3 | 4
  is_completed: boolean
  position: number
  layer: 1 | 2 | 3
  created_at: string
  completed_at: string | null
  // Relations
  project?: Project | null
  section?: Section | null
  labels?: { label: Label }[]
  children?: Task[]
}

export interface Label {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface TaskLabel {
  task_id: string
  label_id: string
}

export interface Reminder {
  id: string
  task_id: string
  user_id: string
  trigger_at: string
  type: 'absolute' | 'relative'
  is_sent: boolean
  created_at: string
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Filter {
  id: string
  user_id: string
  name: string
  query: string
  color: string
  position: number
  created_at: string
}
