'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Circle, CheckCircle, Clock, Trash2, Tag, Filter } from 'lucide-react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

export default function InboxPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTaskContent, setNewTaskContent] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .is('project_id', null)
        .order('position')

      setTasks(tasks || [])
      setLoading(false)
    }
    fetchTasks()

    const channel = supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskContent.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: task } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        content: newTaskContent,
        position: tasks.length,
      })
      .select()
      .single()

    if (task) {
      setTasks([...tasks, task])
      setNewTaskContent('')
      setShowQuickAdd(false)
    }
  }

  const toggleComplete = async (task: any) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        is_completed: !task.is_completed,
        completed_at: !task.is_completed ? new Date().toISOString() : null,
      })
      .eq('id', task.id)

    if (!error) {
      setTasks(tasks.map(t =>
        t.id === task.id
          ? { ...t, is_completed: !t.is_completed, completed_at: !task.is_completed ? new Date().toISOString() : null }
          : t
      ))
    }
  }

  const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-500'
      case 2: return 'text-amber-500'
      case 3: return 'text-blue-500'
      case 4: return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d')
  }

  const incompleteTasks = tasks.filter(t => !t.is_completed)
  const completedTasks = tasks.filter(t => t.is_completed)

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-500">{incompleteTasks.length} tasks</p>
        </div>
      </div>

      {showQuickAdd ? (
        <form onSubmit={addTask} className="mb-6">
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <Circle className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 outline-none text-gray-900"
              autoFocus
              onKeyDown={(e) => e.key === 'Escape' && setShowQuickAdd(false)}
            />
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowQuickAdd(true)}
          className="flex items-center gap-3 w-full p-3 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-violet-300 hover:text-violet-600 transition mb-6"
        >
          <Plus className="w-5 h-5" />
          Add a task
        </button>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Your inbox is empty</h3>
          <p className="text-gray-500">Add tasks to get started</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {incompleteTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition"
              >
                <button
                  onClick={() => toggleComplete(task)}
                  className="text-gray-400 hover:text-violet-600 flex-shrink-0"
                >
                  <Circle className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900">{task.content}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {task.due_date && (
                      <span className={`text-xs flex items-center gap-1 ${
                        isPast(new Date(task.due_date)) ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {formatDueDate(task.due_date)}
                      </span>
                    )}
                    {task.priority && task.priority < 3 && (
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        P{task.priority}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {completedTasks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Completed ({completedTasks.length})
              </h3>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 opacity-60"
                  >
                    <button
                      onClick={() => toggleComplete(task)}
                      className="text-violet-600 flex-shrink-0"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <p className="flex-1 min-w-0 text-gray-500 line-through">{task.content}</p>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
