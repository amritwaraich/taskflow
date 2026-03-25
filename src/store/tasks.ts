'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Task, Project, Section, Label } from '@/types'
import * as tasksApi from '@/lib/api/tasks'
import * as projectsApi from '@/lib/api/projects'
import * as sectionsApi from '@/lib/api/sections'
import * as labelsApi from '@/lib/api/labels'

const supabase = createClient()

interface AppState {
  // User
  user: any
  profile: any
  setUser: (user: any) => void
  setProfile: (profile: any) => void

  // Projects
  projects: Project[]
  activeProject: Project | null
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
  setActiveProject: (project: Project | null) => void
  fetchProjects: (userId: string) => Promise<void>

  // Sections
  sections: Record<string, Section[]>
  setSections: (projectId: string, sections: Section[]) => void
  addSection: (section: Section) => void
  updateSection: (id: string, updates: Partial<Section>) => void
  removeSection: (id: string, projectId: string) => void
  fetchSections: (projectId: string) => Promise<void>

  // Tasks
  tasks: Record<string, Task[]>
  inboxTasks: Task[]
  todayTasks: Task[]
  upcomingTasks: Task[]
  setTasks: (projectId: string, tasks: Task[]) => void
  addTask: (projectId: string | null, task: Task) => void
  updateTask: (id: string, updates: Partial<Task>, projectId?: string | null) => void
  removeTask: (id: string, projectId?: string | null) => void
  toggleComplete: (task: Task) => Promise<void>
  reorderTasks: (projectId: string | null, taskIds: string[]) => void
  fetchInboxTasks: (userId: string) => Promise<void>
  fetchTodayTasks: (userId: string) => Promise<void>
  fetchUpcomingTasks: (userId: string) => Promise<void>
  fetchProjectTasks: (projectId: string) => Promise<void>

  // Labels
  labels: Label[]
  setLabels: (labels: Label[]) => void
  addLabel: (label: Label) => void
  updateLabel: (id: string, updates: Partial<Label>) => void
  removeLabel: (id: string) => void
  fetchLabels: (userId: string) => Promise<void>

  // Quick Add Modal
  showQuickAdd: boolean
  quickAddContext: { projectId?: string; sectionId?: string }
  setShowQuickAdd: (show: boolean, context?: { projectId?: string; sectionId?: string }) => void

  // Loading
  loading: boolean
  setLoading: (loading: boolean) => void

  // Initialize
  init: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  // User
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  // Projects
  projects: [],
  activeProject: null,
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p),
    activeProject: state.activeProject?.id === id ? { ...state.activeProject, ...updates } : state.activeProject,
  })),
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    activeProject: state.activeProject?.id === id ? null : state.activeProject,
  })),
  setActiveProject: (project) => set({ activeProject: project }),
  fetchProjects: async (userId) => {
    const { data } = await projectsApi.getProjects(userId)
    if (data) set({ projects: data })
  },

  // Sections
  sections: {},
  setSections: (projectId, sections) => set((state) => ({
    sections: { ...state.sections, [projectId]: sections }
  })),
  addSection: (section) => set((state) => ({
    sections: {
      ...state.sections,
      [section.project_id]: [...(state.sections[section.project_id] || []), section]
    }
  })),
  updateSection: (id, updates) => set((state) => {
    const newSections = { ...state.sections }
    for (const projectId in newSections) {
      newSections[projectId] = newSections[projectId].map((s) =>
        s.id === id ? { ...s, ...updates } : s
      )
    }
    return { sections: newSections }
  }),
  removeSection: (id, projectId) => set((state) => {
    const newSections = { ...state.sections }
    if (projectId && newSections[projectId]) {
      newSections[projectId] = newSections[projectId].filter((s) => s.id !== id)
    }
    return { sections: newSections }
  }),
  fetchSections: async (projectId) => {
    const { data } = await sectionsApi.getSections(projectId)
    if (data) get().setSections(projectId, data)
  },

  // Tasks
  tasks: {},
  inboxTasks: [],
  todayTasks: [],
  upcomingTasks: [],
  setTasks: (projectId, tasks) => set((state) => ({
    tasks: { ...state.tasks, [projectId || 'null']: tasks }
  })),
  addTask: (projectId, task) => set((state) => {
    const key = projectId || 'null'
    const existing = state.tasks[key] || []
    return { tasks: { ...state.tasks, [key]: [...existing, task] } }
  }),
  updateTask: (id, updates, projectId) => set((state) => {
    const newTasks = { ...state.tasks }
    for (const key in newTasks) {
      newTasks[key] = newTasks[key].map((t) =>
        t.id === id ? { ...t, ...updates } : t
      )
    }
    return { tasks: newTasks }
  }),
  removeTask: (id, projectId) => set((state) => {
    const key = projectId || 'null'
    const newTasks = { ...state.tasks }
    if (newTasks[key]) {
      newTasks[key] = newTasks[key].filter((t) => t.id !== id)
    }
    return { tasks: newTasks }
  }),
  toggleComplete: async (task) => {
    const { error } = await tasksApi.toggleTaskComplete(task.id, !task.is_completed)
    if (!error) {
      const updates = {
        is_completed: !task.is_completed,
        completed_at: !task.is_completed ? new Date().toISOString() : null,
      }
      get().updateTask(task.id, updates, task.project_id)
    }
  },
  reorderTasks: async (projectId, taskIds) => {
    const updates = taskIds.map((id, index) => ({ id, position: index }))
    set((state) => {
      const key = projectId || 'null'
      const newTasks = [...(state.tasks[key] || [])]
      const reordered = newTasks.sort((a, b) => {
        const aIndex = taskIds.indexOf(a.id)
        const bIndex = taskIds.indexOf(b.id)
        return aIndex - bIndex
      }).map((t, i) => ({ ...t, position: i }))
      return { tasks: { ...state.tasks, [key]: reordered } }
    })
    // Persist
    await supabase
      .from('tasks')
      .upsert(taskIds.map((id, index) => ({ id, position: index })))
  },
  fetchInboxTasks: async (userId) => {
    const { data } = await tasksApi.getInboxTasks(userId)
    if (data) set({ inboxTasks: data })
  },
  fetchTodayTasks: async (userId) => {
    const { data } = await tasksApi.getTodayTasks(userId)
    if (data) set({ todayTasks: data })
  },
  fetchUpcomingTasks: async (userId) => {
    const { data } = await tasksApi.getUpcomingTasks(userId)
    if (data) set({ upcomingTasks: data })
  },
  fetchProjectTasks: async (projectId) => {
    const { data } = await tasksApi.getTasks(projectId)
    if (data) get().setTasks(projectId, data)
  },

  // Labels
  labels: [],
  setLabels: (labels) => set({ labels }),
  addLabel: (label) => set((state) => ({ labels: [...state.labels, label] })),
  updateLabel: (id, updates) => set((state) => ({
    labels: state.labels.map((l) => l.id === id ? { ...l, ...updates } : l)
  })),
  removeLabel: (id) => set((state) => ({
    labels: state.labels.filter((l) => l.id !== id)
  })),
  fetchLabels: async (userId) => {
    const { data } = await labelsApi.getLabels(userId)
    if (data) set({ labels: data })
  },

  // Quick Add Modal
  showQuickAdd: false,
  quickAddContext: {},
  setShowQuickAdd: (show, context = {}) => set({
    showQuickAdd: show,
    quickAddContext: context,
  }),

  // Loading
  loading: false,
  setLoading: (loading) => set({ loading }),

  // Initialize
  init: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    set({ user })
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      set({ profile })
      await get().fetchProjects(user.id)
      await get().fetchLabels(user.id)
      await get().fetchInboxTasks(user.id)
      await get().fetchTodayTasks(user.id)
      await get().fetchUpcomingTasks(user.id)
    }
  },
}))
