'use client'

import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/types'

const supabase = createClient()

export async function getTasks(projectId?: string, sectionId?: string) {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      project:projects(id, name, color, icon),
      section:sections(id, name),
      labels:task_labels(label:labels(*)),
      children:tasks(id, content, is_completed, priority, due_date, layer, position)
    `)
    .is('parent_id', null)
    .order('position', { ascending: true })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }
  if (sectionId) {
    query = query.eq('section_id', sectionId)
  }

  return query
}

export async function getInboxTasks(userId: string) {
  return supabase
    .from('tasks')
    .select(`
      *,
      labels:task_labels(label:labels(*)),
      children:tasks(id, content, is_completed, priority, due_date, layer, position)
    `)
    .eq('user_id', userId)
    .is('project_id', null)
    .is('parent_id', null)
    .order('position', { ascending: true })
}

export async function getTodayTasks(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return supabase
    .from('tasks')
    .select(`
      *,
      project:projects(id, name, color, icon),
      labels:task_labels(label:labels(*)),
      children:tasks(id, content, is_completed, priority, due_date, layer, position)
    `)
    .eq('user_id', userId)
    .eq('is_completed', false)
    .is('parent_id', null)
    .gte('due_date', today.toISOString())
    .lt('due_date', tomorrow.toISOString())
    .order('position', { ascending: true })
}

export async function getUpcomingTasks(userId: string, days = 7) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + days + 1)

  return supabase
    .from('tasks')
    .select(`
      *,
      project:projects(id, name, color, icon),
      labels:task_labels(label:labels(*)),
      children:tasks(id, content, is_completed, priority, due_date, layer, position)
    `)
    .eq('user_id', userId)
    .eq('is_completed', false)
    .is('parent_id', null)
    .gte('due_date', today.toISOString())
    .lt('due_date', endDate.toISOString())
    .order('due_date', { ascending: true })
}

export async function createTask(task: Partial<Task>) {
  return supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()
}

export async function updateTask(id: string, updates: Partial<Task>) {
  return supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

export async function deleteTask(id: string) {
  // Delete children first
  await supabase.from('tasks').delete().eq('parent_id', id)
  return supabase.from('tasks').delete().eq('id', id)
}

export async function toggleTaskComplete(id: string, isCompleted: boolean) {
  return supabase
    .from('tasks')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('id', id)
}

export async function addSubTask(parentId: string, content: string, userId: string) {
  // Get parent to determine layer
  const { data: parent } = await supabase
    .from('tasks')
    .select('layer, project_id, section_id, grandparent_id')
    .eq('id', parentId)
    .single()

  if (!parent) return { error: 'Parent not found' }

  const layer = Math.min(parent.layer + 1, 3) // Max layer 3

  // Get max position among siblings
  const { data: siblings } = await supabase
    .from('tasks')
    .select('position')
    .eq('parent_id', parentId)
    .order('position', { ascending: false })
    .limit(1)

  const position = siblings?.[0]?.position ?? 0

  return supabase
    .from('tasks')
    .insert({
      user_id: userId,
      content,
      parent_id: parentId,
      grandparent_id: layer === 3 ? parentId : parent.grandparent_id || null,
      project_id: parent.project_id,
      section_id: parent.section_id,
      layer,
      position: position + 1,
    })
    .select()
    .single()
}

export async function getChildTasks(parentId: string) {
  return supabase
    .from('tasks')
    .select(`
      *,
      labels:task_labels(label:labels(*)),
      children:tasks(id, content, is_completed, priority, due_date, layer, position)
    `)
    .eq('parent_id', parentId)
    .order('position', { ascending: true })
}

export async function moveTaskToTopLevel(taskId: string, projectId?: string, sectionId?: string) {
  // Get max position in target
  let query = supabase.from('tasks').select('position').eq('parent_id', null)
  if (projectId) query = query.eq('project_id', projectId)
  if (sectionId) query = query.eq('section_id', sectionId || null)
  if (!projectId && !sectionId) query = query.is('project_id', null)

  const { data: siblings } = await query.order('position', { ascending: false }).limit(1)
  const position = siblings?.[0]?.position ?? 0

  return supabase
    .from('tasks')
    .update({
      parent_id: null,
      grandparent_id: null,
      project_id: projectId ?? null,
      section_id: sectionId ?? null,
      layer: 1,
      position: position + 1,
    })
    .eq('id', taskId)
}

export async function assignLabels(taskId: string, labelIds: string[]) {
  // Remove existing
  await supabase.from('task_labels').delete().eq('task_id', taskId)
  // Add new
  if (labelIds.length > 0) {
    return supabase.from('task_labels').insert(labelIds.map(id => ({ task_id: taskId, label_id: id })))
  }
  return { error: null }
}
