'use client'

import { createClient } from '@/lib/supabase/client'
import type { Section } from '@/types'

const supabase = createClient()

export async function getSections(projectId: string) {
  return supabase
    .from('sections')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
}

export async function createSection(section: Partial<Section>) {
  // Get max position
  const { data: sections } = await supabase
    .from('sections')
    .select('position')
    .eq('project_id', section.project_id)
    .order('position', { ascending: false })
    .limit(1)

  return supabase
    .from('sections')
    .insert({ ...section, position: (sections?.[0]?.position ?? -1) + 1 })
    .select()
    .single()
}

export async function updateSection(id: string, updates: Partial<Section>) {
  return supabase
    .from('sections')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

export async function deleteSection(id: string) {
  // Move tasks to project root (null section_id)
  await supabase
    .from('tasks')
    .update({ section_id: null })
    .eq('section_id', id)

  return supabase.from('sections').delete().eq('id', id)
}

export async function reorderSections(sectionIds: string[]) {
  const updates = sectionIds.map((id, index) =>
    supabase.from('sections').update({ position: index }).eq('id', id)
  )
  return Promise.all(updates)
}
