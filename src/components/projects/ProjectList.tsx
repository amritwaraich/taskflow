'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import type { Project } from '@/types'
import { createProject } from '@/lib/api/projects'
import { ProjectItem } from './ProjectItem'
import { useAppStore } from '@/store/tasks'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { IconPicker } from '@/components/ui/IconPicker'

interface ProjectListProps {
  onUpdate?: () => void
}

export function ProjectList({ onUpdate }: ProjectListProps) {
  const { projects, addProject } = useAppStore()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#8B5CF6')
  const [icon, setIcon] = useState('📁')
  const [creating, setCreating] = useState(false)
  const [step, setStep] = useState<'name' | 'color' | 'icon'>('name')

  const activeProjects = projects.filter((p) => !p.is_archived)

  const handleCreate = async () => {
    if (!name.trim()) return

    setCreating(true)
    const { data } = await createProject({
      name: name.trim(),
      color,
      icon,
      view_style: 'list',
      is_archived: false,
    })
    if (data) {
      addProject(data)
      setShowCreate(false)
      setName('')
      setColor('#8B5CF6')
      setIcon('📁')
      setStep('name')
      onUpdate?.()
    }
    setCreating(false)
  }

  return (
    <div>
      {activeProjects.length > 0 ? (
        <div className="space-y-1">
          {activeProjects.map((project) => (
            <ProjectItem key={project.id} project={project} onUpdate={onUpdate} />
          ))}
        </div>
      ) : (
        <p className="px-3 py-2 text-sm text-gray-400">No projects yet</p>
      )}

      {/* Create project */}
      {showCreate ? (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                  if (e.key === 'Enter') setStep('color')
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
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 mt-2 px-3 py-2 text-sm text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition w-full"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      )}
    </div>
  )
}
