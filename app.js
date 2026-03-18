let elements = [
  {
    id: 1,
    type: "rect",
    x: 100,
    y: 100,
    w: 200,
    h: 100,
    color: "#4CAF50",
  },
];

let currentTool = "select"; // later for toolbar
let editingText = null;

let nextId = 2;

let isResizing = false;
let resizeHandle = null; // "tl", "tr", "bl", "br"

let selectedElement = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Camera (infinite canvas)
let camera = {
  x: 0,
  y: 0,
  zoom: 1,
};

const buttons = document.querySelectorAll("#toolbar button");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentTool = btn.dataset.tool;
    updateToolbar();
  });
});

let currentFileName = "board.kj";

function updateToolbar() {
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tool === currentTool);
  });
}

// initialize
updateToolbar();

// Mouse + input state
let isPanning = false;
let spacePressed = false;
let lastMouse = { x: 0, y: 0 };

// TODO: textarea is now good looking but not working properly, it should be fixed
const textarea = document.getElementById("textEditor");

textarea.addEventListener("blur", stopEditingText);

textarea.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    stopEditingText();
  }
});

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    loadFile(file);
  }
});

window.addEventListener("keydown", (e) => {
  // Save (Ctrl + S)
  // Ctrl+S → Save
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    saveFile(false);
  }

  // Ctrl+Shift+S → Save As
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
    e.preventDefault();
    saveFile(true);
  }

  // Load (Ctrl + O)
  if (e.ctrlKey && e.key === "o") {
    e.preventDefault();
    document.getElementById("fileInput").click();
  }

  // DELETE selected
  if (e.key === "Delete" || e.key === "Backspace") {
    if (selectedElement && !editingText) {
      elements = elements.filter((el) => el !== selectedElement);
      selectedElement = null;
    }
  }

  // DUPLICATE (Ctrl + D)
  if (e.ctrlKey && e.key === "d") {
    e.preventDefault();

    if (selectedElement) {
      const copy = JSON.parse(JSON.stringify(selectedElement));

      copy.id = nextId++;
      copy.x += 20;
      copy.y += 20;

      elements.push(copy);
      selectedElement = copy;
    }
  }

  // TOOL SWITCH
  if (!editingText) {
    if (e.key === "v") currentTool = "select";
    if (e.key === "t") currentTool = "text";
    if (e.key === "r") currentTool = "rect";

    updateToolbar(); // 🔥 ADD THIS
  }

  // Ctrl + ]
  if (e.ctrlKey && e.key === "]") {
    if (selectedElement) {
      elements = elements.filter((el) => el !== selectedElement);
      elements.push(selectedElement);
    }
  }

  // Ctrl + [
  if (e.ctrlKey && e.key === "[") {
    if (selectedElement) {
      elements = elements.filter((el) => el !== selectedElement);
      elements.unshift(selectedElement);
    }
  }

  if (e.key === "Escape") {
    stopEditingText();
    selectedElement = null;
    isDragging = false;
    isResizing = false;
  }
});

// Resize handling
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Track spacebar properly
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    spacePressed = true;
    e.preventDefault(); // prevent page scroll
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    spacePressed = false;
  }
});

// Mouse down → start panning if space OR middle mouse
canvas.addEventListener("mousedown", (e) => {
  const mouse = screenToWorld(e.clientX, e.clientY);

  // PAN
  if (e.button === 1 || spacePressed) {
    isPanning = true;
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
    return;
  }

  // CHECK ELEMENT HIT (top to bottom)
  selectedElement = null;

  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];

    if (
      mouse.x >= el.x &&
      mouse.x <= el.x + el.w &&
      mouse.y >= el.y &&
      mouse.y <= el.y + el.h
    ) {
      selectedElement = el;
      if (selectedElement) {
        const handle = getResizeHandle(selectedElement, mouse);

        if (handle) {
          isResizing = true;
          resizeHandle = handle;
          return;
        }
      }
      isDragging = true;

      dragOffset.x = mouse.x - el.x;
      dragOffset.y = mouse.y - el.y;

      break;
    }
  }

  // TODO: when i am in select tool and double click it should do nothhing(maybe something unique like setting zome to something )

  if (currentTool === "text") {
    const mouse = screenToWorld(e.clientX, e.clientY);

    const newText = {
      id: nextId++,
      type: "text",
      x: mouse.x,
      y: mouse.y,
      text: "",
      style: {
        fontSize: 24,
        fontFamily: "Arial",
        color: "#ffffff",
      },
    };

    elements.push(newText);
    startEditingText(newText);

    return;
  }

  // RECT TOOL → create instantly
  if (currentTool === "rect") {
    const mouse = screenToWorld(e.clientX, e.clientY);

    const newRect = {
      id: nextId++,
      type: "rect",
      x: mouse.x,
      y: mouse.y,
      w: 0,
      h: 0,
      color: randomColor(),
    };

    elements.push(newRect);
    selectedElement = newRect;
    isDragging = true;

    dragOffset.x = 0;
    dragOffset.y = 0;

    return;
  }
});

// Mouse up → stop panning
window.addEventListener("mouseup", () => {
  isPanning = false;
  isDragging = false;
  isResizing = false;
  resizeHandle = null;

  if (selectedElement && selectedElement.type === "rect") {
    if (Math.abs(selectedElement.w) < 5 || Math.abs(selectedElement.h) < 5) {
      elements = elements.filter((el) => el !== selectedElement);
      selectedElement = null;
    }
  }
});

// Mouse move → pan logic
window.addEventListener("mousemove", (e) => {
  if (isPanning) {
    const dx = (e.clientX - lastMouse.x) / camera.zoom;
    const dy = (e.clientY - lastMouse.y) / camera.zoom;

    camera.x -= dx;
    camera.y -= dy;

    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
  }

  if (isDragging && selectedElement && currentTool === "select") {
    const mouse = screenToWorld(e.clientX, e.clientY);

    selectedElement.x = mouse.x - dragOffset.x;
    selectedElement.y = mouse.y - dragOffset.y;
  }

  if (isDragging && selectedElement && currentTool === "rect") {
    const mouse = screenToWorld(e.clientX, e.clientY);

    selectedElement.w = mouse.x - selectedElement.x;
    selectedElement.h = mouse.y - selectedElement.y;
  }

  if (isResizing && selectedElement) {
    const mouse = screenToWorld(e.clientX, e.clientY);
    const el = selectedElement;

    if (resizeHandle === "br") {
      el.w = mouse.x - el.x;
      el.h = mouse.y - el.y;
    }

    if (resizeHandle === "tr") {
      el.w = mouse.x - el.x;
      el.h = el.y + el.h - mouse.y;
      el.y = mouse.y;
    }

    if (resizeHandle === "bl") {
      el.w = el.x + el.w - mouse.x;
      el.h = mouse.y - el.y;
      el.x = mouse.x;
    }

    if (resizeHandle === "tl") {
      el.w = el.x + el.w - mouse.x;
      el.h = el.y + el.h - mouse.y;
      el.x = mouse.x;
      el.y = mouse.y;
    }

    // Prevent negative sizes
    el.w = Math.max(20, el.w);
    el.h = Math.max(20, el.h);
  }
});

// Zoom (centered on cursor)
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const zoomFactor = 1.1;

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const worldX = mouseX / camera.zoom + camera.x;
  const worldY = mouseY / camera.zoom + camera.y;

  if (e.deltaY < 0) {
    camera.zoom *= zoomFactor;
  } else {
    camera.zoom /= zoomFactor;
  }

  camera.zoom = Math.min(Math.max(camera.zoom, 0.1), 5); // clamp zoom

  camera.x = worldX - mouseX / camera.zoom;
  camera.y = worldY - mouseY / camera.zoom;
});

canvas.addEventListener("dblclick", (e) => {
  if (spacePressed || isPanning) return;

  const mouse = screenToWorld(e.clientX, e.clientY);

  // Check if clicking existing text → edit
  // TODO: text resize and drag is not as desired, needs work
  for (let el of elements) {
    if (el.type === "text") {
      const width = ctx.measureText(el.text).width;
      const height = el.style.fontSize;

      if (
        mouse.x >= el.x &&
        mouse.x <= el.x + width &&
        mouse.y <= el.y &&
        mouse.y >= el.y - height
      ) {
        selectedElement = el;
        isDragging = true;

        dragOffset.x = mouse.x - el.x;
        dragOffset.y = mouse.y - el.y;

        break;
      }
    }
  }

  // Create new text
  const newText = {
    id: nextId++,
    type: "text",
    x: mouse.x,
    y: mouse.y,
    text: "",
    style: {
      fontSize: 24,
      fontFamily: "Arial",
      color: "#ffffff",
    },
  };

  elements.push(newText);
  startEditingText(newText);
});

// TODO: save function when called normally is saving normally but also as board.kj

function saveFile(saveAs = false) {
  const data = {
    version: 1,
    elements: elements,
    camera: camera,
  };

  if (saveAs || !currentFileName) {
    const name = prompt("File name:", currentFileName || "board.kj");
    if (!name) return;
    currentFileName = name.endsWith(".kj") ? name : name + ".kj";
  }

  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = currentFileName;
  a.click();

  URL.revokeObjectURL(url);
}

function loadFile(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      elements = data.elements || [];
      camera = data.camera || { x: 0, y: 0, zoom: 1 };

      selectedElement = null;
    } catch (err) {
      alert("Invalid .kj file");
    }
  };

  reader.readAsText(file);
}

function getResizeHandle(el, mouse) {
  const size = 10 / camera.zoom;

  const handles = {
    tl: { x: el.x, y: el.y },
    tr: { x: el.x + el.w, y: el.y },
    bl: { x: el.x, y: el.y + el.h },
    br: { x: el.x + el.w, y: el.y + el.h },
  };

  for (let key in handles) {
    const h = handles[key];
    if (
      mouse.x >= h.x - size &&
      mouse.x <= h.x + size &&
      mouse.y >= h.y - size &&
      mouse.y <= h.y + size
    ) {
      return key;
    }
  }

  return null;
}

function startEditingText(el) {
  const textarea = document.getElementById("textEditor");

  editingText = el;

  textarea.style.display = "block";
  textarea.value = el.text;

  const screenX = (el.x - camera.x) * camera.zoom;
  const screenY = (el.y - camera.y) * camera.zoom;

  textarea.style.left = screenX + "px";
  textarea.style.top = screenY + "px";

  textarea.style.fontSize = el.style.fontSize * camera.zoom + "px";
  textarea.style.fontFamily = el.style.fontFamily;
  textarea.style.color = el.style.color;

  textarea.focus();
}

function stopEditingText() {
  const textarea = document.getElementById("textEditor");

  if (editingText) {
    editingText.text = textarea.value;
  }

  textarea.style.display = "none";
  editingText = null;
}

function randomColor() {
  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function screenToWorld(x, y) {
  return {
    x: x / camera.zoom + camera.x,
    y: y / camera.zoom + camera.y,
  };
}

// Draw loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  drawGrid();
  drawElements();

  ctx.restore();

  requestAnimationFrame(draw);
}

function drawHandles(el) {
  const size = 8 / camera.zoom;

  const points = [
    { x: el.x, y: el.y },
    { x: el.x + el.w, y: el.y },
    { x: el.x, y: el.y + el.h },
    { x: el.x + el.w, y: el.y + el.h },
  ];

  ctx.fillStyle = "#fff";

  points.forEach((p) => {
    ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
  });
}

function drawElements() {
  elements.forEach((el) => {
    if (el.type === "rect") {
      ctx.fillStyle = el.color;
      ctx.fillRect(el.x, el.y, el.w, el.h);

      // Selection outline
      if (selectedElement === el) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2 / camera.zoom;
        ctx.strokeRect(el.x, el.y, el.w, el.h);

        drawHandles(el);
      }
    }
    if (el.type === "text") {
      ctx.fillStyle = el.style.color;
      ctx.font = `${el.style.fontSize}px ${el.style.fontFamily}`;
      ctx.fillText(el.text, el.x, el.y);
    }
  });
}

// Grid
function drawGrid() {
  const size = 50;

  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;

  const startX = Math.floor(camera.x / size) * size;
  const endX = startX + canvas.width / camera.zoom + size;

  const startY = Math.floor(camera.y / size) * size;
  const endY = startY + canvas.height / camera.zoom + size;

  for (let x = startX; x < endX; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }

  for (let y = startY; y < endY; y += size) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }
}

// Start
draw();
