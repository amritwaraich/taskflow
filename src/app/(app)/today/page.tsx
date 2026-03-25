'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Circle, CheckCircle, Clock } from 'lucide-react'
import { format, isToday } from 'date-fns'

export default function TodayPage() {
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
        .select('*, project:projects(name, color, icon)')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('position')

      const todayTasks = (tasks || []).filter((task: any) =>
        task.due_date && isToday(new Date(task.due_date))
      )

      setTasks(todayTasks)
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

  const toggleComplete = async (task: any) => {
    await supabase
      .from('tasks')
      .update({
        is_completed: !task.is_completed,
        completed_at: !task.is_completed ? new Date().toISOString() : null,
      })
      .eq('id', task.id)

    setTasks(tasks.filter(t => t.id !== task.id))
  }

  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Today</h1>
        <p className="text-gray-500">{today}</p>
      </div>

      {showQuickAdd && (
        <form className="mb-6">
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <Circle className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 outline-none text-gray-900"
              autoFocus
            />
          </div>
        </form>
      )}

      {!showQuickAdd && (
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
          <h3 className="text-lg font-medium text-gray-900 mb-1">All done for today!</h3>
          <p className="text-gray-500">No tasks due today. Enjoy your free time.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
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
                {task.project && (
                  <span className="text-xs text-gray-500">
                    {task.project.icon} {task.project.name}
                  </span>
                )}
              </div>
              {task.due_date && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(task.due_date), 'h:mm a')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
