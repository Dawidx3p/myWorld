const API_BASE = 'https://notes-api-3kto.onrender.com/api';

/* --- NOTATKI --- */
const addNoteBtn = document.getElementById("add-note-btn");
const noteModal = document.getElementById("note-modal");
const closeNoteModal = document.getElementById("close-modal");
const saveNoteBtn = document.getElementById("modal-save-btn");
const modalNoteTitle = document.getElementById("modal-note-title");
const modalNoteContent = document.getElementById("modal-note-content");

const viewModal = document.getElementById("view-modal");
const closeViewModal = document.getElementById("close-view-modal");
const viewNoteTitle = document.getElementById("view-note-title");
const viewNoteContent = document.getElementById("view-note-content");
const editNoteBtn = document.getElementById("edit-note-btn");
const deleteNoteBtn = document.getElementById("delete-note-btn");

const editModal = document.getElementById("edit-modal");
const closeEditModal = document.getElementById("close-edit-modal");
const editTitle = document.getElementById("edit-note-title");
const editContent = document.getElementById("edit-note-content");
const saveEditBtn = document.getElementById("save-edit-btn");

const notesList = document.getElementById("notes-list");
let currentNoteId = null;

addNoteBtn.addEventListener("click", () => {
  modalNoteTitle.value = "";
  modalNoteContent.value = "";
  noteModal.style.display = "flex";
});

closeNoteModal.addEventListener("click", () => noteModal.style.display = "none");

saveNoteBtn.addEventListener("click", async () => {
  const note = {
    title: modalNoteTitle.value.trim(),
    content: modalNoteContent.value.trim()
  };
  await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  noteModal.style.display = "none";
  loadNotes();
});

async function loadNotes() {
  const res = await fetch(`${API_BASE}/notes`);
  const notes = await res.json();
  notesList.innerHTML = "";
  notes.forEach(note => {
    const li = document.createElement("li");
    li.textContent = note.title;
    li.addEventListener("click", () => openViewNote(note));
    notesList.appendChild(li);
  });
}

function openViewNote(note) {
  currentNoteId = note.id;
  viewNoteTitle.value = note.title;
  viewNoteContent.textContent = note.content;
  viewModal.style.display = "flex";
}

closeViewModal.addEventListener("click", () => viewModal.style.display = "none");

editNoteBtn.addEventListener("click", () => {
  editTitle.value = viewNoteTitle.value;
  editContent.value = viewNoteContent.textContent;
  viewModal.style.display = "none";
  editModal.style.display = "flex";
});

closeEditModal.addEventListener("click", () => editModal.style.display = "none");

saveEditBtn.addEventListener("click", async () => {
  await fetch(`${API_BASE}/notes/${currentNoteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: editTitle.value.trim(),
      content: editContent.value.trim()
    })
  });
  editModal.style.display = "none";
  loadNotes();
});

deleteNoteBtn.addEventListener("click", async () => {
  if (confirm("Usunąć notatkę?")) {
    await fetch(`${API_BASE}/notes/${currentNoteId}`, { method: 'DELETE' });
    viewModal.style.display = "none";
    loadNotes();
  }
});

/* --- ZADANIA --- */
const oneTimeList = document.getElementById("one-time-list");
const dailyList = document.getElementById("daily-list");
const addOneTimeBtn = document.getElementById("add-one-time-task-btn");
const addDailyBtn = document.getElementById("add-daily-task-btn");

addOneTimeBtn.addEventListener("click", () => createTaskInput("one-time", oneTimeList));
addDailyBtn.addEventListener("click", () => createTaskInput("daily", dailyList));

function createTaskInput(type, listEl) {
  const row = document.createElement("div");
  row.className = "task-input-row";

  const input = document.createElement("input");
  input.placeholder = "Wpisz treść zadania";

  const btn = document.createElement("button");
  btn.textContent = "Zapisz";

  btn.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) return;
    await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type })
    });
    loadTasks();
  });

  row.appendChild(input);
  row.appendChild(btn);
  listEl.prepend(row);
}

async function loadTasks() {
  const oneTime = await (await fetch(`${API_BASE}/tasks?type=one-time`)).json();
  const daily = await (await fetch(`${API_BASE}/tasks?type=daily`)).json();

  renderTaskList(oneTime, oneTimeList, "one-time");
  renderTaskList(daily, dailyList, "daily");
}

function renderTaskList(tasks, listEl, type) {
  listEl.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");

    const left = document.createElement("div");
    left.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!task.done;

    checkbox.addEventListener("change", async () => {
      await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: checkbox.checked })
      });
      loadTasks();
    });

    const text = document.createElement("span");
    text.textContent = task.text;

    left.appendChild(checkbox);
    left.appendChild(text);

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.title = "Usuń";
    delBtn.addEventListener("click", async () => {
      await fetch(`${API_BASE}/tasks/${task.id}`, { method: "DELETE" });
      loadTasks();
    });

    li.appendChild(left);
    li.appendChild(delBtn);
    listEl.appendChild(li);
  });
}

/* Start */
loadNotes();
loadTasks();