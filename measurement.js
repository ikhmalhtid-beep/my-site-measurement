export function createRoom(name, type = "General") {
  return { id: crypto.randomUUID(), name, type, measures: [], sketch: null };
}

export function addLinearMeasurement(room, label, millimetres) {
  const mm = Number(millimetres);
  if (!Number.isFinite(mm) || mm <= 0) throw new Error("Ukuran mesti lebih besar daripada 0 mm.");
  room.measures.push({ label, mm, created: new Date().toISOString() });
}

export function addFloorArea(room, length, width) {
  const l = Number(length), w = Number(width);
  if (!Number.isFinite(l) || !Number.isFinite(w) || l <= 0 || w <= 0) {
    throw new Error("Panjang dan lebar mesti nombor yang sah dalam mm.");
  }
  room.measures.push({
    label: `Floor area (${l} × ${w} mm)`,
    mm: null,
    length: l,
    width: w,
    areaSqft: (l * w) / 92903.04,
    areaM2: (l * w) / 1000000
  });
}

export function measurementCount(rooms) {
  return rooms.reduce((total, room) => total + room.measures.length, 0);
}

export function measurementsToCSV(project, rooms) {
  const rows = [["Project", "Room", "Category", "Measurement", "mm", "Length mm", "Width mm", "Area sqft", "Area m2"]];
  rooms.forEach(room => room.measures.forEach(item => rows.push([
    project.name, room.name, room.type, item.label, item.mm ?? "",
    item.length ?? "", item.width ?? "", item.areaSqft ?? "", item.areaM2 ?? ""
  ])));
  return "\ufeff" + rows.map(row =>
    row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
  ).join("\n");
}
