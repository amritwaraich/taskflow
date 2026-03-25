'use client'

import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types'

const supabase = createClient()

export async function getProjects(userId: string) {
  return supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
}

export async function getProject(id: string) {
  return supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
}

export async function createProject(project: Partial<Project>) {
  return supabase
    .from('projects')
    .insert(project)
    .select()
    .single()
}

export async function updateProject(id: string, updates: Partial<Project>) {
  return supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

export async function deleteProject(id: string) {
  // Archive instead of hard delete
  return supabase
    .from('projects')
    .update({ is_archived: true })
    .eq('id', id)
}

export async function archiveProject(id: string) {
  return supabase
    .from('projects')
    .update({ is_archived: true })
    .eq('id', id)
}

export async function unarchiveProject(id: string) {
  return supabase
    .from('projects')
    .update({ is_archived: false })
    .eq('id', id)
}

export async function getArchivedProjects(userId: string) {
  return supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', true)
    .order('updated_at', { ascending: false })
}

export async function updateProjectViewStyle(id: string, viewStyle: 'list' | 'board') {
  return supabase
    .from('projects')
    .update({ view_style: viewStyle })
    .eq('id', id)
}

export async function reorderProjects(projectIds: string[]) {
  // Batch update positions
  const updates = projectIds.map((id, index) =>
    supabase.from('projects').update({ position: index }).eq('id', id)
  )
  return Promise.all(updates)
}
