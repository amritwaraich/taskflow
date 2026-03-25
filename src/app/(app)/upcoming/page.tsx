'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Circle, CheckCircle, Clock } from 'lucide-react'
import { format, addDays, isSameDay, startOfDay } from 'date-fns'

export default function UpcomingPage() {
  const [tasksByDate, setTasksByDate] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const startDate = startOfDay(new Date())
      const endDate = addDays(startDate, 7)

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*, project:projects(name, color, icon)')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .gte('due_date', startDate.toISOString())
        .lte('due_date', endDate.toISOString())
        .order('due_date')

      // Group by date
      const grouped: Record<string, any[]> = {}
      ;(tasks || []).forEach((task: any) => {
        const dateKey = format(new Date(task.due_date), 'yyyy-MM-dd')
        if (!grouped[dateKey]) grouped[dateKey] = []
        grouped[dateKey].push(task)
      })

      setTasksByDate(grouped)
      setLoading(false)
    }
    fetchTasks()
  }, [])

  const toggleComplete = async (task: any) => {
    await supabase
      .from('tasks')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', task.id)
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      date,
      key: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEEE'),
      fullLabel: format(date, 'EEEE, MMMM d'),
    }
  })

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upcoming</h1>
        <p className="text-gray-500">Next 7 days</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-8">
          {days.map(({ date, key, label, fullLabel }) => {
            const tasks = tasksByDate[key] || []
            return (
              <div key={key}>
                <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <span>{label}</span>
                  <span className="text-gray-300">•</span>
                  <span className="font-normal">{fullLabel}</span>
                </h2>
                {tasks.length === 0 ? (
                  <p className="text-sm text-gray-400 pl-4">No tasks</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition"
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
          })}
        </div>
      )}
    </div>
  )
}
