'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Filter, Trash2, Edit2, Check } from 'lucide-react'

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#1F2937',
]

export default function FiltersPage() {
  const [filters, setFilters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newFilterName, setNewFilterName] = useState('')
  const [newFilterQuery, setNewFilterQuery] = useState('')
  const [newFilterColor, setNewFilterColor] = useState('#8B5CF6')
  const supabase = createClient()

  useEffect(() => {
    const fetchFilters = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: filters } = await supabase
        .from('filters')
        .select('*')
        .eq('user_id', user.id)
        .order('position')

      setFilters(filters || [])
      setLoading(false)
    }
    fetchFilters()
  }, [])

  const addFilter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFilterName.trim() || !newFilterQuery.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: filter } = await supabase
      .from('filters')
      .insert({
        user_id: user.id,
        name: newFilterName,
        query: newFilterQuery,
        color: newFilterColor,
        position: filters.length,
      })
      .select()
      .single()

    if (filter) {
      setFilters([...filters, filter])
      setNewFilterName('')
      setNewFilterQuery('')
      setNewFilterColor('#8B5CF6')
      setShowAddForm(false)
    }
  }

  const deleteFilter = async (filterId: string) => {
    await supabase.from('filters').delete().eq('id', filterId)
    setFilters(filters.filter(f => f.id !== filterId))
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Filters</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Filter
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addFilter} className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="space-y-3">
            <input
              type="text"
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              placeholder="Filter name (e.g., High Priority)..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              autoFocus
            />
            <input
              type="text"
              value={newFilterQuery}
              onChange={(e) => setNewFilterQuery(e.target.value)}
              placeholder="Query (e.g., p1 or today)..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewFilterColor(color)}
                    className={`w-6 h-6 rounded-full transition ${
                      newFilterColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filters.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No filters yet</h3>
          <p className="text-gray-500">Create custom filters to quickly find your tasks</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: filter.color }}
              />
              <div className="flex-1">
                <span className="text-gray-900">{filter.name}</span>
                <span className="text-xs text-gray-400 ml-2 font-mono">{filter.query}</span>
              </div>
              <button
                onClick={() => deleteFilter(filter.id)}
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
