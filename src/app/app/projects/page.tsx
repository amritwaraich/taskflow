'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, LayoutGrid, Archive } from 'lucide-react'
import { useAppStore } from '@/store/tasks'
import { ProjectItem } from '@/components/projects/ProjectItem'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { IconPicker } from '@/components/ui/IconPicker'
import { createProject } from '@/lib/api/projects'
import { Loader2 } from 'lucide-react'

export default function ProjectsPage() {
  const { projects, addProject, user } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#8B5CF6')
  const [icon, setIcon] = useState('📁')
  const [step, setStep] = useState<'name' | 'color' | 'icon'>('name')
  const [creating, setCreating] = useState(false)

  const activeProjects = projects.filter((p) => !p.is_archived)

  const handleCreate = async () => {
    if (!name.trim() || !user) return

    setCreating(true)
    const { data } = await createProject({
      name: name.trim(),
      color,
      icon,
      view_style: 'list',
      is_archived: false,
      user_id: user.id,
    })
    if (data) {
      addProject(data)
      setShowCreate(false)
      setName('')
      setColor('#8B5CF6')
      setIcon('📁')
      setStep('name')
    }
    setCreating(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500">{activeProjects.length} projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {activeProjects.length === 0 && !showCreate ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No projects yet</h3>
          <p className="text-gray-500 mb-4">Create your first project to get started</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.map((project) => (
            <Link
              key={project.id}
              href={`/app/projects/${project.id}`}
              className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-violet-200 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{project.icon || '📁'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-violet-600 transition">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-xs text-gray-500 capitalize">
                      {project.view_style} view
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Create new card */}
          {showCreate && (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-violet-200 p-6">
              {step === 'name' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Project name..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && name.trim()) setStep('color')
                      if (e.key === 'Escape') setShowCreate(false)
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
                      onClick={() => setShowCreate(false)}
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
                    <button
                      onClick={() => setStep('icon')}
                      className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setStep('name')}
                      className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {step === 'icon' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Pick an icon</p>
                  <IconPicker value={icon} onChange={setIcon} />
                  <div className="flex gap-2">
                    {creating ? (
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
                      onClick={() => setStep('color')}
                      className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Archived projects */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Archive className="w-5 h-5 text-gray-400" />
          Archived Projects
        </h2>
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-500">Archived projects will appear here</p>
        </div>
      </div>
    </div>
  )
}
