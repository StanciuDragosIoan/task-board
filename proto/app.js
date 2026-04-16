// The three columns. Fixed — users can't add or remove columns.
const COLUMNS = [
  { id: "todo", title: "Todo", color: "#38bdf8" },
  { id: "doing", title: "In Progress", color: "#a78bfa" },
  { id: "done", title: "Done", color: "#34d399" },
];

// All tasks. Loaded from localStorage on startup.
// Each task is just: { id, title, columnId }
let tasks = loadTasks();

// Which task is currently being dragged
let dragTaskId = null;

function loadTasks() {
  const raw = localStorage.getItem("basic-board-tasks");
  return raw ? JSON.parse(raw) : [];
}

function saveTasks() {
  localStorage.setItem("basic-board-tasks", JSON.stringify(tasks));
}

// CRUD operations on tasks. Each one updates localStorage and re-renders the board.

function addTask(title, columnId) {
  tasks.push({
    id: crypto.randomUUID(),
    title,
    columnId,
  });
  saveTasks();
  render();
}

function moveTask(taskId, newColumnId) {
  tasks = tasks.map((t) =>
    t.id === taskId ? { ...t, columnId: newColumnId } : t,
  );
  saveTasks();
  render();
}

function deleteTask(taskId) {
  tasks = tasks.filter((t) => t.id !== taskId);
  saveTasks();
  render();
}

// rendering

function render() {
  const board = document.getElementById("board");
  board.innerHTML = ""; // wipe everything

  COLUMNS.forEach((col) => {
    const colTasks = tasks.filter((t) => t.columnId === col.id);
    board.appendChild(renderColumn(col, colTasks));
  });
}

function renderColumn(col, colTasks) {
  // Create the column element
  const el = document.createElement("div");
  el.className = "column";
  el.dataset.columnId = col.id;
  el.style.setProperty("--col-color", col.color); // CSS can now use var(--col-color)

  el.innerHTML = `
    <div class="col-header">
      <div class="col-header-left">
        <span class="col-dot" style="background:${col.color}"></span>
        <span class="col-title">${col.title}</span>
        <span class="col-count">${colTasks.length}</span>
      </div>
      <button class="add-btn" title="Add card">+</button>
    </div>
    <div class="card-list"></div>
  `;

  // Render each card into the card-list
  const list = el.querySelector(".card-list");
  colTasks.forEach((task) => list.appendChild(renderCard(task)));

  // "+" button — shows an inline input
  el.querySelector(".add-btn").addEventListener("click", () => {
    showAddInput(el, col.id);
  });

  // Drop zone events (explained in the DnD section)
  el.addEventListener("dragover", handleDragOver);
  el.addEventListener("dragenter", handleDragEnter);
  el.addEventListener("dragleave", handleDragLeave);
  el.addEventListener("drop", (e) => handleDrop(e, col.id));

  return el;
}

function renderCard(task) {
  const el = document.createElement("div");
  el.className = "card";
  el.draggable = true; // opt this element into HTML5 DnD
  el.dataset.taskId = task.id; // attach the task id to the DOM element
  el.textContent = task.title; // safe — textContent never parses HTML

  el.addEventListener("dragstart", (e) => {
    dragTaskId = task.id;
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    requestAnimationFrame(() => el.classList.add("dragging"));
  });

  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
    dragTaskId = null;
    document
      .querySelectorAll(".column")
      .forEach((c) => c.classList.remove("drag-over"));
  });

  // Double-click to delete
  el.addEventListener("dblclick", () => {
    if (confirm(`Delete "${task.title}"?`)) deleteTask(task.id);
  });

  return el;
}

function showAddInput(columnEl, columnId) {
  // Don't show two inputs at once
  if (columnEl.querySelector(".add-input")) return;

  const input = document.createElement("input");
  input.className = "add-input";
  input.type = "text";
  input.placeholder = "Card title…";
  columnEl.appendChild(input);
  input.focus();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const title = input.value.trim();
      if (title)
        addTask(title, columnId); // addTask calls render(), removing the input
      else input.remove();
    }
    if (e.key === "Escape") {
      input.remove();
    }
  });

  // Click outside = cancel
  input.addEventListener("blur", () => input.remove());
}

// Track enter/leave per column to prevent highlight flickering
// (explained in detail in howToBuildPrototype.md)
const dragCounters = {};

function handleDragOver(e) {
  // REQUIRED — without this line, the 'drop' event never fires
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDragEnter(e) {
  e.preventDefault();
  const col = e.currentTarget;
  const id = col.dataset.columnId;
  dragCounters[id] = (dragCounters[id] || 0) + 1;
  col.classList.add("drag-over");
}

function handleDragLeave(e) {
  const col = e.currentTarget;
  const id = col.dataset.columnId;
  dragCounters[id] = (dragCounters[id] || 0) - 1;
  if (dragCounters[id] <= 0) {
    col.classList.remove("drag-over");
    dragCounters[id] = 0;
  }
}

function handleDrop(e, columnId) {
  e.preventDefault();
  const taskId = e.dataTransfer.getData("text/plain");
  if (taskId) moveTask(taskId, columnId);
}

render();
