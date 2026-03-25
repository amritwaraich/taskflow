'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Loader2, Tag } from 'lucide-react'
import { useAppStore } from '@/store/tasks'
import { createLabel, updateLabel, deleteLabel } from '@/lib/api/labels'
import { ColorPicker } from '@/components/ui/ColorPicker'
import type { Label } from '@/types'

export default function LabelsPage() {
  const { labels, fetchLabels, addLabel, updateLabel: updateLabelInStore, removeLabel, user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#8B5CF6')
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<'name' | 'color'>('name')

  useEffect(() => {
    if (user) {
      fetchLabels(user.id).then(() => setLoading(false))
    }
  }, [user, fetchLabels])

  const handleCreate = async () => {
    if (!name.trim() || !user) return

    setSaving(true)
    const { data } = await createLabel({
      name: name.trim(),
      color,
      user_id: user.id,
    })
    if (data) {
      addLabel(data)
      setShowCreate(false)
      setName('')
      setColor('#8B5CF6')
      setStep('name')
    }
    setSaving(false)
  }

  const handleUpdate = async (id: string) => {
    if (!name.trim()) return

    setSaving(true)
    const { data } = await updateLabel(id, { name: name.trim(), color })
    if (data) {
      updateLabelInStore(id, data)
    }
    setEditingId(null)
    setName('')
    setColor('#8B5CF6')
    setStep('name')
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this label? It will be removed from all tasks.')) {
      await deleteLabel(id)
      removeLabel(id)
    }
  }

  const startEdit = (label: Label) => {
    setEditingId(label.id)
    setName(label.name)
    setColor(label.color)
    setStep('name')
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Labels</h1>
          <p className="text-gray-500">{labels.length} labels</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Label
        </button>
      </div>

      {/* Labels List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : labels.length === 0 && !showCreate ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No labels yet</h3>
          <p className="text-gray-500 mb-4">Create labels to organize your tasks</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Label
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Create new */}
          {showCreate && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              {step === 'name' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Label name..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && name.trim()) setStep('color')
                      if (e.key === 'Escape') {
                        setShowCreate(false)
                        setName('')
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep('color')}
                      disabled={!name.trim()}
                      className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => {
                        setShowCreate(false)
                        setName('')
                      }}
                      className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {step === 'color' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Pick a color</p>
                  <ColorPicker value={color} onChange={setColor} />
                  <div className="flex gap-2">
                    {saving ? (
                      <Loader2 className="px-3 py-1.5 text-violet-600 animate-spin" />
                    ) : (
                      <button
                        onClick={handleCreate}
                        className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                      >
                        Create
                      </button>
                    )}
                    <button
                      onClick={() => setStep('name')}
                      className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Labels */}
          {labels.map((label) => (
            <div
              key={label.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition"
            >
              {editingId === label.id ? (
                <div className="space-y-3">
                  {step === 'name' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && name.trim()) setStep('color')
                          if (e.key === 'Escape') {
                            setEditingId(null)
                            setName('')
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setStep('color')}
                          disabled={!name.trim()}
                          className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setName('')
                          }}
                          className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 'color' && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">Pick a color</p>
                      <ColorPicker value={color} onChange={setColor} />
                      <div className="flex gap-2">
                        {saving ? (
                          <Loader2 className="px-3 py-1.5 text-violet-600 animate-spin" />
                        ) : (
                          <button
                            onClick={() => handleUpdate(label.id)}
                            className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                          >
                            Save
                          </button>
                        )}
                        <button
                          onClick={() => setStep('name')}
                          className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="flex-1 font-medium text-gray-900">{label.name}</span>
                  <button
                    onClick={() => startEdit(label)}
                    className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(label.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
