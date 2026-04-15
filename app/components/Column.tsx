'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, ColumnType } from '@/app/types'
import { TaskCard } from './TaskCard'

interface ColumnProps {
  column: ColumnType
  tasks: Task[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
}

export function Column({ column, tasks, onAddTask, onEditTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col w-72 shrink-0 rounded-2xl transition-all duration-200"
      style={{
        background: 'var(--bg-col)',
        border: isOver
          ? `1px solid ${column.color}`
          : '1px solid var(--border)',
        boxShadow: isOver
          ? `0 0 0 1px ${column.color}44, 0 0 20px ${column.color}22`
          : undefined,
        padding: '12px',
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: column.color,
              boxShadow: `0 0 8px ${column.color}88`,
            }}
          />
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-lo)' }}
          >
            {column.title}
          </h2>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: 'var(--border)',
              color: 'var(--text-dim)',
            }}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Subtle top accent line */}
      <div
        className="h-px mb-3 rounded-full opacity-40"
        style={{ background: `linear-gradient(90deg, ${column.color}, transparent)` }}
      />

      {/* Task list */}
      <SortableContext
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 flex-1 min-h-[80px]">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add task button */}
      <button
        onClick={onAddTask}
        className="mt-3 w-full py-2 flex items-center justify-center gap-1 rounded-lg text-xs font-medium transition-all duration-150"
        style={{
          color: 'var(--text-dim)',
          border: '1px dashed var(--border)',
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLButtonElement).style.color = column.color
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = column.color + '66'
          ;(e.currentTarget as HTMLButtonElement).style.background = column.color + '0d'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Add task
      </button>
    </div>
  )
}
