'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Tag, Edit2, Trash2, Check } from 'lucide-react'

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#1F2937',
]

export default function LabelsPage() {
  const [labels, setLabels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#8B5CF6')
  const [showAddForm, setShowAddForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchLabels = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: labels } = await supabase
        .from('labels')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      setLabels(labels || [])
      setLoading(false)
    }
    fetchLabels()
  }, [])

  const addLabel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLabelName.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: label } = await supabase
      .from('labels')
      .insert({
        user_id: user.id,
        name: newLabelName,
        color: newLabelColor,
      })
      .select()
      .single()

    if (label) {
      setLabels([...labels, label])
      setNewLabelName('')
      setNewLabelColor('#8B5CF6')
      setShowAddForm(false)
    }
  }

  const deleteLabel = async (labelId: string) => {
    await supabase.from('labels').delete().eq('id', labelId)
    setLabels(labels.filter(l => l.id !== labelId))
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Labels</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Label
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addLabel} className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewLabelColor(color)}
                  className={`w-6 h-6 rounded-full transition ${
                    newLabelColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : labels.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No labels yet</h3>
          <p className="text-gray-500">Create labels to organize your tasks</p>
        </div>
      ) : (
        <div className="space-y-2">
          {labels.map((label) => (
            <div
              key={label.id}
              className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              <span className="flex-1 text-gray-900">{label.name}</span>
              <button
                onClick={() => deleteLabel(label.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
