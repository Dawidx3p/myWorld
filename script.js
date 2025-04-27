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
let activeNoteId = null;
let currentNoteImage = "";

const loadingScreen = document.getElementById("loading-screen");
const modalNoteImageInput = document.getElementById("note-image-input");
const editNoteImageInput = document.getElementById("edit-note-image-input"); // Nowy input na zdjęcie
let editedNoteOriginalImage = ""; // Przechowuje stare zdjęcie
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/doaarrwc3/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'number1'; // ustalimy zaraz

async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  return data.secure_url; // gotowy URL obrazka
}


function showLoading() {
  loadingScreen.style.display = "flex";
}

function hideLoading() {
  loadingScreen.style.display = "none";
}

addNoteBtn.addEventListener("click", () => {
    modalNoteTitle.value = "";
    modalNoteContent.value = "";
    noteModal.style.display = "flex";
  
    // 👉 Automatyczny focus na tytuł
    setTimeout(() => modalNoteTitle.focus(), 10);
  });

closeNoteModal.addEventListener("click", () => noteModal.style.display = "none");

saveNoteBtn.addEventListener("click", async () => {
  const title = modalNoteTitle.value.trim();
  const content = modalNoteContent.value.trim();
  
  let imageURL = "";

  if (modalNoteImageInput.files.length > 0) {
    const file = modalNoteImageInput.files[0];
    imageURL = await uploadImageToCloudinary(file);
  }

  const note = { title, content, image: imageURL };

  await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });

  noteModal.style.display = "none";
  location.reload();
});

// funkcja konwertująca plik na base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

async function loadNotes() {
  showLoading();
  activeNoteId = null; // reset aktywnej notatki!
  const res = await fetch(`${API_BASE}/notes`);
  const notes = await res.json();
  renderNotes(notes);
  hideLoading();
}

function renderNotes(notes) {
  notesList.innerHTML = "";
  notes.forEach(note => {
    const icon = document.createElement("div");
icon.className = "note-icon";

// symbol notatki
icon.textContent = "📄";

// overlay z tytułem
const titleOverlay = document.createElement("div");
titleOverlay.className = "note-icon-title";
titleOverlay.textContent = note.title;
icon.appendChild(titleOverlay);

// klik = pierwszy pokazuje, drugi otwiera
icon.addEventListener("click", () => {
  if (activeNoteId === note.id) {
    openViewNote(note); // klik 2
    activeNoteId = null;
  } else {
    activeNoteId = note.id; // klik 1
    renderNotes(notes);     // odśwież widok z aktywnym
  }
});

if (activeNoteId === note.id) {
  icon.classList.add("active");
}

notesList.appendChild(icon);
  });
}

function openViewNote(note) {
  currentNoteId = note.id;
  currentNoteImage = note.image || "";

  viewNoteTitle.value = note.title;
  viewNoteContent.innerHTML = "";

  if (note.image) {
    const img = document.createElement("img");
    img.src = note.image;
    img.alt = "Załączony obrazek";
    img.classList.add("note-image"); // <-- dodajemy klasę CSS
    viewNoteContent.appendChild(img);
  }

  const textContent = document.createElement("div");
  textContent.innerHTML = note.content;
  textContent.classList.add("note-text"); // <-- dodajemy klasę CSS
  viewNoteContent.appendChild(textContent);

  viewModal.style.display = "flex";
}

closeViewModal.addEventListener("click", () => viewModal.style.display = "none");


editNoteBtn.addEventListener("click", () => {
  editTitle.value = viewNoteTitle.value;
  editContent.value = viewNoteContent.textContent;
  editedNoteOriginalImage = currentNoteImage; // Przechowaj istniejące zdjęcie!
  viewModal.style.display = "none";
  editModal.style.display = "flex";
});

saveEditBtn.addEventListener("click", async () => {
  const title = editTitle.value.trim();
  const content = editContent.value.trim();

  let imageURL = editedNoteOriginalImage; // domyślnie stare zdjęcie

  if (editNoteImageInput && editNoteImageInput.files && editNoteImageInput.files[0]) {
    // Jeśli użytkownik wybrał nowe zdjęcie
    const file = editNoteImageInput.files[0];
    imageURL = await uploadImageToCloudinary(file);
  }

  await fetch(`${API_BASE}/notes/${currentNoteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      content,
      image: imageURL
    })
  });

  editModal.style.display = "none";

  // Reset inputu pliku na przyszłość
  editNoteImageInput.value = "";

  location.reload();
});

closeEditModal.addEventListener("click", () => editModal.style.display = "none");


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
  
    const saveTask = async () => {
      const text = input.value.trim();
      if (!text) return;
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type })
      });
      loadTasks();
    };
  
    btn.addEventListener("click", saveTask);
  
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveTask();
      }
    });
  
    row.appendChild(input);
    row.appendChild(btn);
    listEl.prepend(row);
    input.focus();
  }

  async function loadTasks() {
    showLoading();
    const oneTime = await (await fetch(`${API_BASE}/tasks?type=one-time`)).json();
    const daily = await (await fetch(`${API_BASE}/tasks?type=daily`)).json();
    renderTaskList(oneTime, oneTimeList, "one-time");
    renderTaskList(daily, dailyList, "daily");
    hideLoading();
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