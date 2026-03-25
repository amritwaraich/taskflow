'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Archive,
  Eye,
  List,
  LayoutGrid,
} from 'lucide-react'
import type { Project } from '@/types'
import { updateProject, archiveProject, updateProjectViewStyle } from '@/lib/api/projects'
import { useAppStore } from '@/store/tasks'
import { ColorDot } from '@/components/ui/ColorPicker'
import clsx from 'clsx'

interface ProjectItemProps {
  project: Project
  isActive?: boolean
  onUpdate?: () => void
}

export function ProjectItem({ project, isActive = false, onUpdate }: ProjectItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const { updateProject: updateProjectInStore, removeProject } = useAppStore()

  const handleArchive = async () => {
    await archiveProject(project.id)
    removeProject(project.id)
    setShowMenu(false)
    onUpdate?.()
  }

  const handleToggleView = async (view: 'list' | 'board') => {
    await updateProjectViewStyle(project.id, view)
    updateProjectInStore(project.id, { view_style: view })
    setShowMenu(false)
    onUpdate?.()
  }

  const handleDelete = async () => {
    if (confirm(`Delete project "${project.name}"? Tasks will be archived.`)) {
      await archiveProject(project.id)
      removeProject(project.id)
      setShowMenu(false)
      onUpdate?.()
    }
  }

  return (
    <div
      className={clsx(
        'group relative flex items-center gap-3 px-3 py-2 rounded-lg transition',
        isActive
          ? 'bg-violet-50 text-violet-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Link
        href={`/app/projects/${project.id}`}
        className="flex-1 flex items-center gap-3 min-w-0"
      >
        <span className="text-lg flex-shrink-0">{project.icon || '📁'}</span>
        <span className="truncate text-sm font-medium">{project.name}</span>
        <ColorDot color={project.color} size="sm" />
      </Link>

      {/* View toggle */}
      <Link
        href={`/app/projects/${project.id}?view=${project.view_style === 'list' ? 'board' : 'list'}`}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition"
        onClick={(e) => {
          e.preventDefault()
          handleToggleView(project.view_style === 'list' ? 'board' : 'list')
        }}
      >
        {project.view_style === 'list' ? (
          <List className="w-4 h-4" />
        ) : (
          <LayoutGrid className="w-4 h-4" />
        )}
      </Link>

      {/* Menu */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.preventDefault()
            setShowMenu(!showMenu)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1 min-w-40 animate-fadeIn">
              <Link
                href={`/app/projects/${project.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setShowMenu(false)}
              >
                <Eye className="w-4 h-4" />
                Open
              </Link>
              <button
                onClick={() => handleToggleView(project.view_style === 'list' ? 'board' : 'list')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                {project.view_style === 'list' ? (
                  <>
                    <LayoutGrid className="w-4 h-4" />
                    Switch to Board
                  </>
                ) : (
                  <>
                    <List className="w-4 h-4" />
                    Switch to List
                  </>
                )}
              </button>
              <button
                onClick={handleArchive}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
