"use client";

import { useState, useEffect, useRef } from "react";
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
import { supabase } from "../lib/supabase";

type ModalState =
  | { open: false }
  | { open: true; task?: Task; defaultColumnId?: string };

export function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);

      const { data, error } = await supabase.from("tasks").select("*");

      if (error) {
        console.error("Load error:", error);
        setLoading(false);
        return;
      }

      setTasks(
        (data ?? []).map((t) => ({
          id: t.id,
          title: t.title,
          columnId: t.column_id,
          description: t.description ?? "",
          priority: t.priority ?? "normal",
          tags: t.tags ?? [],
          assignee: t.assignee ?? null,
          from: t.from ?? "",
        })),
      );

      setLoading(false);
    }

    loadTasks();
  }, []);

  async function addTask(task: Omit<Task, "id">) {
    const payload = {
      title: task.title,
      column_id: task.columnId,
      description: task.description ?? "",
      priority: task.priority ?? "normal",
      tags: task.tags ?? [],
      assignee: task.assignee ?? null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return;
    }

    // IMPORTANT: use DB response
    setTasks((prev) => [
      ...prev,
      {
        id: data.id,
        title: data.title,
        columnId: data.column_id,
        description: data.description,
        priority: data.priority,
        tags: data.tags,
        assignee: data.assignee,
        from: data.from,
      },
    ]);
  }

  async function updateTask(updated: Task) {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        title: updated.title,
        column_id: updated.columnId,
        description: updated.description,
        priority: updated.priority,
        tags: updated.tags,
        assignee: updated.assignee,
      })
      .eq("id", updated.id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? {
              id: data.id,
              title: data.title,
              columnId: data.column_id,
              description: data.description,
              priority: data.priority,
              tags: data.tags,
              assignee: data.assignee,
              from: data.from,
            }
          : t,
      ),
    );
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return;
    }

    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const dragStartColumnRef = useRef<string | null>(null);
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
    const task = tasks.find((t) => t.id === String(active.id)) ?? null;
    setActiveTask(task);
    dragStartColumnRef.current = task?.columnId ?? null;
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
    const startColumn = dragStartColumnRef.current;
    dragStartColumnRef.current = null;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const draggedTask = tasks.find((t) => t.id === activeId);
    if (!draggedTask) return;

    const overColumn = COLUMNS.find((c) => c.id === overId);
    const overTask = tasks.find((t) => t.id === overId);
    const targetColumnId = overColumn?.id ?? overTask?.columnId;
    if (!targetColumnId) return;

    // handleDragOver already updated local state optimistically, so compare
    // against where the drag started — not the current (already-moved) state.
    if (startColumn !== targetColumnId) {
      updateTask({ ...draggedTask, columnId: targetColumnId });
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
      updateTask(taskData);
    } else {
      addTask(taskData);
    }
    setModal({ open: false });
  }

  function handleDelete(id: string) {
    deleteTask(id);
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
