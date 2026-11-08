import { loadDB, saveDB, createEmptyDB, downloadBlob, escapeHTML } from "./storage.js";
import { createRoom, addLinearMeasurement, addFloorArea, measurementCount, measurementsToCSV } from "./measurement.js";
import { createSketchController } from "./sketch.js";

let db = loadDB();
const $ = id => document.getElementById(id);
const canvas = $("board");
const sketch = createSketchController(canvas);

function persist(message = "Saved locally") {
  saveDB(db);
  $("saveState").textContent = message;
  renderAll();
}
function showTab(id) {
  document.querySelectorAll(".page").forEach(page => page.classList.toggle("hidden", page.id !== id));
  document.querySelectorAll("nav button").forEach(button => button.classList.toggle("active", button.dataset.tab === id));
  if (id === "sketch") updateSketchList();
}
function fillProjectForm() {
  const fields = { pName: "name", pClient: "client", pAddress: "address", pDate: "date", pBy: "by", pNotes: "notes" };
  Object.entries(fields).forEach(([id, key]) => { $(id).value = db.project[key] || ""; });
}
function saveProject() {
  db.project = {
    name: $("pName").value, client: $("pClient").value,
    address: $("pAddress").value, date: $("pDate").value,
    by: $("pBy").value, notes: $("pNotes").value
  };
  persist();
  alert("Maklumat projek disimpan.");
}
function addNewRoom() {
  const name = $("rName").value.trim();
  if (!name) return alert("Masukkan nama ruang dahulu.");
  db.rooms.push(createRoom(name, $("rType").value));
  $("rName").value = "";
  persist();
}
function addRoomMeasurement(roomId) {
  const room = db.rooms.find(item => item.id === roomId);
  const label = prompt("Nama ukuran (contoh: Wall A / Floor length)");
  if (!label) return;
  const value = prompt("Masukkan ukuran dalam mm (contoh: 3500)");
  if (value === null) return;
  try { addLinearMeasurement(room, label, value); persist(); }
  catch (error) { alert(error.message); }
}
function addRoomArea(roomId) {
  const room = db.rooms.find(item => item.id === roomId);
  const length = prompt("Panjang lantai (mm)");
  if (length === null) return;
  const width = prompt("Lebar lantai (mm)");
  if (width === null) return;
  try { addFloorArea(room, length, width); persist(); }
  catch (error) { alert(error.message); }
}
function deleteRoom(roomId) {
  if (confirm("Padam ruang dan semua rekodnya?")) {
    db.rooms = db.rooms.filter(room => room.id !== roomId);
    persist();
  }
}
function renderRooms() {
  const list = $("roomList");
  list.innerHTML = "";
  if (!db.rooms.length) {
    list.innerHTML = '<div class="card muted">Belum ada ruang. Tambah ruang di atas.</div>';
    return;
  }
  db.rooms.forEach(room => {
    const card = document.createElement("div");
    card.className = "card";
    const rows = room.measures.map(item => `
      <div class="item row"><span>${escapeHTML(item.label)}</span>
      <strong>${item.mm ? `${item.mm.toLocaleString()} mm` : `${item.areaSqft.toFixed(2)} sqft · ${item.areaM2.toFixed(2)} m²`}</strong></div>
    `).join("");
    card.innerHTML = `
      <div class="row"><div><h2>${escapeHTML(room.name)}</h2><span class="pill">${escapeHTML(room.type)}</span></div>
      <button class="danger" data-delete-room="${room.id}">Padam</button></div>
      <div>${rows || '<p class="muted">Belum ada ukuran.</p>'}</div>
      <div class="actions"><button data-add-measure="${room.id}">+ Ukuran linear</button>
      <button class="secondary" data-add-area="${room.id}">+ Keluasan lantai</button>
      <button class="secondary" data-open-sketch="${room.id}">Sketch ruang</button></div>`;
    list.appendChild(card);
  });
}
function populateRoomSelects() {
  ["sketchRoom", "photoRoom"].forEach(id => {
    const select = $(id), previous = select.value;
    select.innerHTML = '<option value="">Pilih ruang</option>' +
      db.rooms.map(room => `<option value="${room.id}">${escapeHTML(room.name)}</option>`).join("");
    if (db.rooms.some(room => room.id === previous)) select.value = previous;
  });
}
function selectedSketchRoom() { return db.rooms.find(room => room.id === $("sketchRoom").value); }
function loadSelectedSketch() {
  const room = selectedSketchRoom();
  sketch.load(room?.sketch || null);
}
function updateSketchList() {
  $("sketchSaved").textContent = db.rooms.filter(room => room.sketch).map(room => room.name).join(", ") || "Belum ada sketch tersimpan.";
  loadSelectedSketch();
}
function saveCurrentSketch() {
  const room = selectedSketchRoom();
  if (!room) return alert("Pilih ruang dahulu.");
  room.sketch = sketch.toDataURL();
  persist();
  alert(`Sketch disimpan pada ruang ${room.name}.`);
}
function addPhoto() {
  const file = $("photoFile").files[0];
  if (!file) return alert("Pilih gambar dahulu.");
  const reader = new FileReader();
  reader.onload = () => {
    db.photos.push({
      id: crypto.randomUUID(), roomId: $("photoRoom").value,
      note: $("photoNote").value, image: reader.result,
      date: new Date().toISOString()
    });
    $("photoFile").value = "";
    $("photoNote").value = "";
    persist();
    alert("Foto dan nota disimpan.");
  };
  reader.readAsDataURL(file);
}
function renderPhotos() {
  const list = $("photoList");
  list.innerHTML = "";
  [...db.photos].reverse().forEach(photo => {
    const room = db.rooms.find(item => item.id === photo.roomId);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<div class="row"><strong>${escapeHTML(room?.name || "General site")}</strong>
      <button class="danger" data-delete-photo="${photo.id}">Padam</button></div>
      <p>${escapeHTML(photo.note || "Tiada nota")}</p><img class="photo" alt="Site photo" src="${photo.image}">`;
    list.appendChild(card);
  });
  if (!db.photos.length) list.innerHTML = '<div class="card muted">Belum ada foto.</div>';
}
function renderAll() {
  $("homeProject").textContent = db.project.name || "Belum ada projek";
  $("homeMeta").textContent = [db.project.client, db.project.date, db.project.address].filter(Boolean).join(" · ") || "Lengkapkan maklumat projek.";
  $("countRooms").textContent = db.rooms.length;
  $("countMeasures").textContent = measurementCount(db.rooms);
  $("countPhotos").textContent = db.photos.length;
  renderRooms();
  populateRoomSelects();
  renderPhotos();
  updateSketchList();
}
function exportJSON() {
  downloadBlob(new Blob([JSON.stringify(db, null, 2)], { type: "application/json" }), "my-site-measurement-backup.json");
}
function exportCSV() {
  downloadBlob(new Blob([measurementsToCSV(db.project, db.rooms)], { type: "text/csv;charset=utf-8" }), "site-measurements.csv");
}
function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!imported.project || !Array.isArray(imported.rooms)) throw new Error("Invalid backup");
      db = imported;
      fillProjectForm();
      persist("Backup imported");
      alert("Backup berjaya diimport.");
    } catch { alert("Fail backup tidak sah."); }
  };
  reader.readAsText(file);
}
function resetAll() {
  if (!confirm("Amaran: semua data projek dalam peranti ini akan dipadam. Teruskan?")) return;
  db = createEmptyDB();
  fillProjectForm();
  persist();
}

document.querySelectorAll("nav [data-tab]").forEach(button => button.addEventListener("click", () => showTab(button.dataset.tab)));
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => showTab(button.dataset.go)));
$("saveProject").addEventListener("click", saveProject);
$("addRoom").addEventListener("click", addNewRoom);
$("roomList").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.deleteRoom) deleteRoom(button.dataset.deleteRoom);
  if (button.dataset.addMeasure) addRoomMeasurement(button.dataset.addMeasure);
  if (button.dataset.addArea) addRoomArea(button.dataset.addArea);
  if (button.dataset.openSketch) {
    showTab("sketch");
    $("sketchRoom").value = button.dataset.openSketch;
    loadSelectedSketch();
  }
});
$("sketchRoom").addEventListener("change", loadSelectedSketch);
$("penTool").addEventListener("click", () => sketch.setTool("pen"));
$("eraserTool").addEventListener("click", () => sketch.setTool("eraser"));
$("undoSketch").addEventListener("click", () => sketch.undo());
$("clearSketch").addEventListener("click", () => { if (confirm("Kosongkan sketch semasa?")) sketch.clear(); });
$("saveSketch").addEventListener("click", saveCurrentSketch);
$("downloadSketch").addEventListener("click", () => sketch.download());
$("addPhoto").addEventListener("click", addPhoto);
$("photoList").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-photo]");
  if (!button) return;
  db.photos = db.photos.filter(photo => photo.id !== button.dataset.deletePhoto);
  persist();
});
$("exportJSON").addEventListener("click", exportJSON);
$("exportCSV").addEventListener("click", exportCSV);
$("importButton").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", importJSON);
$("printReport").addEventListener("click", () => window.print());
$("resetAll").addEventListener("click", resetAll);

fillProjectForm();
renderAll();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js").catch(error => console.warn("Service worker registration failed:", error));
}
