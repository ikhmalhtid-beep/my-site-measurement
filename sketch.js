export function createSketchController(canvas, onChange) {
  const ctx = canvas.getContext("2d");
  let tool = "pen";
  let drawing = false;
  let lastPoint = null;
  const history = [];

  function drawGrid() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#edf0ed";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height
    };
  }

  canvas.addEventListener("pointerdown", event => {
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    history.push(canvas.toDataURL());
    if (history.length > 20) history.shift();
    lastPoint = pointFromEvent(event);
  });

  canvas.addEventListener("pointermove", event => {
    if (!drawing) return;
    const point = pointFromEvent(event);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = tool === "eraser" ? 28 : 4;
    ctx.strokeStyle = tool === "eraser" ? "#fff" : "#17211d";
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint = point;
    onChange?.();
  });

  const stop = () => { drawing = false; lastPoint = null; };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  function load(dataURL) {
    drawGrid();
    history.length = 0;
    if (!dataURL) return;
    const image = new Image();
    image.onload = () => ctx.drawImage(image, 0, 0);
    image.src = dataURL;
  }

  return {
    setTool(value) { tool = value; },
    clear() { history.push(canvas.toDataURL()); drawGrid(); },
    undo() {
      const previous = history.pop();
      if (!previous) return;
      const image = new Image();
      image.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0); };
      image.src = previous;
    },
    load,
    toDataURL() { return canvas.toDataURL("image/png"); },
    download() {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "site-sketch.png";
      link.click();
    }
  };
}
