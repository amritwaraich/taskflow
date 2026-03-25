'use client'

import { createClient } from '@/lib/supabase/client'
import type { Label } from '@/types'

const supabase = createClient()

export async function getLabels(userId: string) {
  return supabase
    .from('labels')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
}

export async function getLabel(id: string) {
  return supabase
    .from('labels')
    .select('*')
    .eq('id', id)
    .single()
}

export async function createLabel(label: Partial<Label>) {
  return supabase
    .from('labels')
    .insert(label)
    .select()
    .single()
}

export async function updateLabel(id: string, updates: Partial<Label>) {
  return supabase
    .from('labels')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

export async function deleteLabel(id: string) {
  // Remove from all task_labels first
  await supabase.from('task_labels').delete().eq('label_id', id)
  return supabase.from('labels').delete().eq('id', id)
}

export async function getTaskLabels(taskId: string) {
  return supabase
    .from('task_labels')
    .select('label:labels(*)')
    .eq('task_id', taskId)
}

export async function assignLabelToTask(taskId: string, labelId: string) {
  return supabase
    .from('task_labels')
    .insert({ task_id: taskId, label_id: labelId })
    .select()
    .single()
}

export async function removeLabelFromTask(taskId: string, labelId: string) {
  return supabase
    .from('task_labels')
    .delete()
    .eq('task_id', taskId)
    .eq('label_id', labelId)
}
