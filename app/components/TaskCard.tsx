'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/app/types'
import { PRIORITY_CONFIG } from '@/app/types'

interface TaskCardProps {
  task: Task
  onEdit?: () => void
  overlay?: boolean
}

export function TaskCard({ task, onEdit, overlay = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const prio = PRIORITY_CONFIG[task.priority]

  const cardContent = (
    <>
      {/* Priority bar + tags row */}
      <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase"
          style={{ color: prio.color, background: prio.bg }}
        >
          {task.priority === 'urgent' && (
            <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {prio.label}
        </span>
        {task.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              color: 'var(--text-lo)',
              background: 'var(--border)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <p
        className="text-sm font-medium leading-snug mb-1.5"
        style={{ color: 'var(--text-hi)' }}
      >
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p
          className="text-xs leading-relaxed mb-3 line-clamp-2"
          style={{ color: 'var(--text-lo)' }}
        >
          {task.description}
        </p>
      )}

      {/* Footer: assignee */}
      <div className="flex items-center justify-between">
        {task.assignee ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              background: stringToColor(task.assignee),
              color: '#fff',
            }}
          >
            {task.assignee.slice(0, 2).toUpperCase()}
          </div>
        ) : (
          <div />
        )}
        <svg
          className="w-3 h-3 opacity-30"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>
    </>
  )

  if (overlay) {
    return (
      <div
        className="rounded-xl p-3 w-72 cursor-grabbing rotate-2"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-drag)',
        }}
      >
        {cardContent}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        opacity: isDragging ? 0.35 : 1,
      }}
      {...attributes}
      {...listeners}
      onClick={onEdit}
      className="rounded-xl p-3 cursor-grab active:cursor-grabbing select-none transition-[background,border-color,box-shadow] duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)]"
    >
      {cardContent}
    </div>
  )
}

// Deterministic color from a string (for assignee avatars)
function stringToColor(str: string): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#06b6d4',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
