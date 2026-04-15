"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Task } from "@/app/types";
import { COLUMNS, SAMPLE_TASKS } from "@/app/types";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";

type ModalState =
  | { open: false }
  | { open: true; task?: Task; defaultColumnId?: string };

export function Board() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // if (typeof window === "undefined") return SAMPLE_TASKS;
    // try {
    //   const stored = localStorage.getItem("taskboard-tasks");
    //   return stored ? (JSON.parse(stored) as Task[]) : SAMPLE_TASKS;
    // } catch {
    //   return SAMPLE_TASKS;
    // }
    return SAMPLE_TASKS;
  });

  useEffect(() => {
    const stored = localStorage.getItem("taskboard-tasks");
    if (stored) {
      setTasks(JSON.parse(stored) as Task[]);
    }
  }, []);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [modal, setModal] = useState<ModalState>({ open: false });

  // Sync theme state with what the layout script already applied
  useEffect(() => {
    const stored = localStorage.getItem("taskboard-theme");
    setIsDark(stored !== "light");
  }, []);

  // Persist tasks on every change
  useEffect(() => {
    localStorage.setItem("taskboard-tasks", JSON.stringify(tasks));
  }, [tasks]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("taskboard-theme", next ? "dark" : "light");
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveTask(tasks.find((t) => t.id === active.id) ?? null);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overColumn = COLUMNS.find((c) => c.id === overId);
    const overTask = tasks.find((t) => t.id === overId);
    const targetColumnId = overColumn?.id ?? overTask?.columnId;

    if (targetColumnId && activeTask.columnId !== targetColumnId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, columnId: targetColumnId } : t,
        ),
      );
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const draggedTask = tasks.find((t) => t.id === activeId);
    const targetTask = tasks.find((t) => t.id === overId);

    // Reorder within the same column
    if (
      draggedTask &&
      targetTask &&
      draggedTask.columnId === targetTask.columnId
    ) {
      const col = draggedTask.columnId;
      const columnTasks = tasks.filter((t) => t.columnId === col);
      const oldIdx = columnTasks.findIndex((t) => t.id === activeId);
      const newIdx = columnTasks.findIndex((t) => t.id === overId);
      if (oldIdx !== newIdx) {
        const reordered = arrayMove(columnTasks, oldIdx, newIdx);
        setTasks((prev) => [
          ...prev.filter((t) => t.columnId !== col),
          ...reordered,
        ]);
      }
    }
  }

  function openNewTask(defaultColumnId?: string) {
    setModal({ open: true, defaultColumnId });
  }

  function openEditTask(task: Task) {
    setModal({ open: true, task });
  }

  function handleSave(taskData: Task | Omit<Task, "id">) {
    if ("id" in taskData) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? taskData : t)),
      );
    } else {
      setTasks((prev) => [...prev, { ...taskData, id: crypto.randomUUID() }]);
    }
    setModal({ open: false });
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setModal({ open: false });
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--bg-board)" }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{
          background: "var(--bg-col)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Logo / title */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #a78bfa, #38bdf8)" }}
          >
            T
          </div>
          <div>
            <h1
              className="text-sm font-bold tracking-tight"
              style={{ color: "var(--text-hi)" }}
            >
              TaskBoard
            </h1>
            <p className="text-[10px]" style={{ color: "var(--text-dim)" }}>
              {tasks.length} tasks ·{" "}
              {tasks.filter((t) => t.columnId === "done").length} done
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-lo)",
            }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* New task */}
          <button
            onClick={() => openNewTask()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #38bdf8)" }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Task
          </button>
        </div>
      </header>

      {/* ── Board ──────────────────────────────────────── */}
      <DndContext
        id="taskboard-dnd"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-6 overflow-x-auto flex-1 items-start">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={tasks.filter((t) => t.columnId === column.id)}
              onAddTask={() => openNewTask(column.id)}
              onEditTask={openEditTask}
            />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.18,0.67,0.6,1.22)",
          }}
        >
          {activeTask && <TaskCard task={activeTask} overlay />}
        </DragOverlay>
      </DndContext>

      {/* ── Modal ─────────────────────────────────────── */}
      {modal.open && (
        <TaskModal
          task={modal.task}
          defaultColumnId={modal.defaultColumnId}
          onSave={handleSave}
          onDelete={modal.task ? () => handleDelete(modal.task!.id) : undefined}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
