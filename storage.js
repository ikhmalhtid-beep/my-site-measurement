export const STORAGE_KEY = "mySiteMeasurement_v1";

export function createEmptyDB() {
  return {
    project: {
      name: "", client: "", address: "",
      date: new Date().toISOString().slice(0, 10),
      by: "", notes: ""
    },
    rooms: [],
    photos: []
  };
}

export function loadDB() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || createEmptyDB();
  } catch {
    return createEmptyDB();
  }
}

export function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
