"use client";

import { useState, useEffect, useRef } from "react";
import type { Task, ColumnType, Priority } from "@/app/types";
import { COLUMNS, PRIORITY_CONFIG } from "@/app/types";

interface TaskModalProps {
  task?: Task;
  defaultColumnId?: string;
  onSave: (task: Task | Omit<Task, "id">) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function TaskModal({
  task,
  defaultColumnId,
  onSave,
  onDelete,
  onClose,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [from, setFrom] = useState(task?.from ?? "");
  const [priority, setPriority] = useState<Priority>(
    task?.priority ?? "medium",
  );
  const [tags, setTags] = useState(task?.tags.join(", ") ?? "");
  const [assignee, setAssignee] = useState(task?.assignee ?? "");
  const [columnId, setColumnId] = useState(
    task?.columnId ?? defaultColumnId ?? "todo",
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    // Lock scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleSave() {
    if (!title.trim()) return;
    const data = {
      title: title.trim(),
      description: description.trim(),
      from: from.trim(),
      priority,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      assignee: assignee.trim().toUpperCase().slice(0, 3),
      columnId,
    };
    if (task) {
      onSave({ ...data, id: task.id });
    } else {
      onSave(data);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
  }

  const colConfig = COLUMNS.find((c) => c.id === columnId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: "var(--bg-col)",
          border: "1px solid var(--border-strong)",
          boxShadow: "var(--shadow-drag)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--text-hi)" }}
          >
            {task ? "Edit task" : "New task"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-hi)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-dim)")
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Title */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--text-lo)" }}
          >
            Title <span style={{ color: "#f87171" }}>*</span>
          </label>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
            style={{
              background: "var(--bg-card)",
              border: `1px solid ${title ? "var(--border-strong)" : "var(--border)"}`,
              color: "var(--text-hi)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--border-strong)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = title
                ? "var(--border-strong)"
                : "var(--border)")
            }
          />
        </div>
        {/* From */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--text-lo)" }}
          >
            From
          </label>
          <input
            ref={titleRef}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Who comissioned this task?"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
            style={{
              background: "var(--bg-card)",
              border: `1px solid ${from ? "var(--border-strong)" : "var(--border)"}`,
              color: "var(--text-hi)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--border-strong)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = title
                ? "var(--border-strong)"
                : "var(--border)")
            }
          />
        </div>

        {/* Description */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--text-lo)" }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more context…"
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-hi)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--border-strong)")
            }
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Priority + Column row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-lo)" }}
            >
              Priority
            </label>
            <div className="grid grid-cols-2 gap-1">
              {(
                Object.entries(PRIORITY_CONFIG) as [
                  Priority,
                  (typeof PRIORITY_CONFIG)[Priority],
                ][]
              ).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                  style={{
                    color: cfg.color,
                    background: priority === key ? cfg.bg : "var(--bg-card)",
                    border: `1px solid ${priority === key ? cfg.color + "44" : "var(--border)"}`,
                  }}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-lo)" }}
            >
              Column
            </label>
            <div className="flex flex-col gap-1">
              {COLUMNS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setColumnId(col.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-left"
                  style={{
                    background:
                      columnId === col.id ? col.color + "18" : "var(--bg-card)",
                    border: `1px solid ${columnId === col.id ? col.color + "44" : "var(--border)"}`,
                    color: columnId === col.id ? col.color : "var(--text-lo)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: col.color }}
                  />
                  {col.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tags + Assignee row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-lo)" }}
            >
              Tags{" "}
              <span className="font-normal opacity-60">(comma separated)</span>
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ui, backend, urgent"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-hi)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--border-strong)")
              }
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-lo)" }}
            >
              Assignee{" "}
              <span className="font-normal opacity-60">(initials)</span>
            </label>
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="AM"
              maxLength={3}
              className="w-full px-3 py-2 rounded-lg text-sm uppercase outline-none transition-all"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-hi)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--border-strong)")
              }
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <div>
            {onDelete && !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-dim)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-dim)")
                }
              >
                Delete
              </button>
            )}
            {confirmDelete && (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#f87171" }}>
                  Sure?
                </span>
                <button
                  onClick={onDelete}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    color: "#f87171",
                    background: "rgba(248,113,113,0.1)",
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ color: "var(--text-dim)" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-xl transition-all"
              style={{
                color: "var(--text-lo)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-strong)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: colConfig?.color ?? "#a78bfa",
                color: "#fff",
                boxShadow: title.trim()
                  ? `0 0 16px ${(colConfig?.color ?? "#a78bfa") + "66"}`
                  : undefined,
              }}
            >
              {task ? "Save changes" : "Create task"}
            </button>
          </div>
        </div>

        <p
          className="text-[10px] text-center"
          style={{ color: "var(--text-dim)" }}
        >
          ⌘ Enter to save · Esc to cancel
        </p>
      </div>
    </div>
  );
}
