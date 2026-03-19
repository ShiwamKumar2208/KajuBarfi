let elements = [
  {
    id: 1,
    type: "image",
    x: 100,
    y: 100,
    w: 200,
    h: 100,
    src: "./wel.png",
  },
];

let textEditing = {
  active: false,
  element: null,
  cursorPos: 0,
};

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

const textarea = document.getElementById("textEditor");

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    loadFile(file);
  }
});

textEditing.selectAll = false;

window.addEventListener("keydown", (e) => {
  // Save (Ctrl + S)
  // Ctrl+S → Save
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    saveFile(false);
  }

  // Ctrl + E → Export PNG
  if (e.ctrlKey && e.key === "e") {
    e.preventDefault();
    exportPNG();
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

  if (e.ctrlKey && e.key.toLowerCase() === "v" && !textEditing.active) {
    navigator.clipboard.read().then(async (items) => {
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const reader = new FileReader();

            reader.onload = function (event) {
              const img = new Image();

              img.onload = () => {
                const center = screenToWorld(
                  canvas.width / 2,
                  canvas.height / 2,
                );

                const newImage = {
                  id: nextId++,
                  type: "image",
                  x: center.x,
                  y: center.y,
                  w: img.width / 2,
                  h: img.height / 2,
                  src: event.target.result,
                };

                elements.push(newImage);
                selectedElement = newImage;
              };

              img.src = event.target.result;
            };

            reader.readAsDataURL(blob);
          }
        }
      }
    });
  }

  if (textEditing.active && currentTool === "text") {
    const el = textEditing.element;
    const step = e.shiftKey ? 10 : 10; // Shift = faster movement

    if (e.ctrlKey && e.code === "ArrowUp") {
      selectedElement.y -= step;
      e.preventDefault();
    }

    if (e.ctrlKey && e.code === "ArrowDown") {
      selectedElement.y += step;
      e.preventDefault();
    }

    if (e.ctrlKey && e.code === "ArrowLeft") {
      selectedElement.x -= step;
      e.preventDefault();
    }

    if (e.ctrlKey && e.code === "ArrowRight") {
      selectedElement.x += step;
      e.preventDefault();
    }

    // SELECT ALL
    if (e.ctrlKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      textEditing.selectAll = true;
      textEditing.cursorPos = el.text.length;
      return;
    }

    // COPY
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      navigator.clipboard.writeText(el.text);
      return;
    }

    // CUT
    if (e.ctrlKey && e.key.toLowerCase() === "x") {
      e.preventDefault();
      navigator.clipboard.writeText(el.text);
      el.text = "";
      textEditing.cursorPos = 0;
      return;
    }

    // PASTE
    if (e.ctrlKey && e.key.toLowerCase() === "v") {
      e.preventDefault();

      navigator.clipboard.readText().then((clip) => {
        if (textEditing.selectAll) {
          el.text = clip;
          textEditing.cursorPos = clip.length;
          textEditing.selectAll = false;
        } else {
          el.text =
            el.text.slice(0, textEditing.cursorPos) +
            clip +
            el.text.slice(textEditing.cursorPos);

          textEditing.cursorPos += clip.length;
        }
      });

      return;
    }

    if (e.key.length === 1 && !e.ctrlKey) {
      el.text =
        el.text.slice(0, textEditing.cursorPos) +
        e.key +
        el.text.slice(textEditing.cursorPos);

      textEditing.cursorPos++;
    }

    if (e.key === "Backspace") {
      if (textEditing.cursorPos > 0) {
        el.text =
          el.text.slice(0, textEditing.cursorPos - 1) +
          el.text.slice(textEditing.cursorPos);

        textEditing.cursorPos--;
      }
    }

    if (e.key === "Enter") {
      el.text =
        el.text.slice(0, textEditing.cursorPos) +
        "\n" +
        el.text.slice(textEditing.cursorPos);

      textEditing.cursorPos++;
    }

    if (e.key === "Escape") {
      stopEditingText();
    }

    if (e.ctrlKey && e.key === "=") {
      selectedElement.style.fontSize += 2;
    }

    if (e.ctrlKey && e.key === "-") {
      selectedElement.style.fontSize = Math.max(
        10,
        selectedElement.style.fontSize - 2,
      );
    }

    e.preventDefault();
    return;
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

    currentTool = "select";
    updateToolbar();

    // selectedElement = null;
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

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
});

canvas.addEventListener("drop", (e) => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();

    img.onload = () => {
      const mouse = screenToWorld(e.clientX, e.clientY);

      const newImage = {
        id: nextId++,
        type: "image",
        x: mouse.x,
        y: mouse.y,
        w: img.width / 2,
        h: img.height / 2,
        src: event.target.result,
      };

      elements.push(newImage);
      selectedElement = newImage;
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
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

  if (currentTool === "text") {
    const mouse = screenToWorld(e.clientX, e.clientY);

    // Check if clicking existing text → edit
    for (let el of elements) {
      if (el.type === "text") {
        ctx.font = `${el.style.fontSize}px ${el.style.fontFamily}`;

        const lines = el.text.split("\n");
        const width = Math.max(...lines.map((l) => ctx.measureText(l).width));
        const height = lines.length * el.style.fontSize;

        if (
          mouse.x >= el.x &&
          mouse.x <= el.x + width &&
          mouse.y >= el.y &&
          mouse.y <= el.y + height
        ) {
          selectedElement = el;

          // 🔥 ONLY edit if text tool is active
          if (currentTool === "text") {
            startEditingText(el);
            return;
          }

          // 🔥 OTHERWISE → allow resize or drag

          const handle = getResizeHandle(el, mouse);
          if (handle) {
            isResizing = true;
            resizeHandle = handle;
            return;
          }

          isDragging = true;
          dragOffset.x = mouse.x - el.x;
          dragOffset.y = mouse.y - el.y;

          break;
        }
      }
    }

    // Otherwise create new text
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

  if (
    isDragging &&
    selectedElement &&
    currentTool === "select" &&
    !textEditing.active
  ) {
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

    // 🔥 TEXT RESIZE
    if (el.type === "text") {
      if (resizeHandle === "br") {
        const dy = mouse.y - el.y;
        el.style.fontSize = Math.max(10, dy);
      }
      return;
    }

    // 🧱 RECT RESIZE (existing code)
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

  saveFile(true);
});

function exportPNG() {
  // Create temp canvas
  console.log("Exporting PNG...");
  const exportCanvas = document.createElement("canvas");
  const exportCtx = exportCanvas.getContext("2d");

  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;

  // Copy current view
  exportCtx.fillStyle = "#111"; // background
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  exportCtx.save();

  // Apply same camera transform
  exportCtx.scale(camera.zoom, camera.zoom);
  exportCtx.translate(-camera.x, -camera.y);

  // Draw elements
  elements.forEach((el) => {
    if (el.type === "rect") {
      exportCtx.fillStyle = el.color;
      exportCtx.fillRect(el.x, el.y, el.w, el.h);
    }

    if (el.type === "text") {
      exportCtx.fillStyle = el.style.color;
      exportCtx.font = `${el.style.fontSize}px ${el.style.fontFamily}`;

      const lines = el.text.split("\n");
      lines.forEach((line, i) => {
        exportCtx.fillText(line, el.x, el.y + i * el.style.fontSize);
      });
    }

    if (el.type === "image") {
      exportCtx.drawImage(el.img, el.x, el.y, el.w, el.h);
    }
  });

  exportCtx.restore();

  // Download
  const link = document.createElement("a");
  downname = prompt("File name:", "kaju-export.png");
  link.download = downname.endsWith(".png") ? downname : downname + ".png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}

function getTextBounds(el) {
  ctx.font = `${el.style.fontSize}px ${el.style.fontFamily}`;

  const lines = el.text.split("\n");
  const width = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const height = lines.length * el.style.fontSize;

  return { w: width, h: height };
}

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

// TODO: clean unused code such as the resizeable text box logic code which i changed with ctrl + arrow keys

function getResizeHandle(el, mouse) {
  const size = 10 / camera.zoom;

  let w = el.w;
  let h = el.h;

  // 🔥 FIX: handle text
  if (el.type === "text") {
    const bounds = getTextBounds(el);
    w = bounds.w;
    h = bounds.h;
  }

  const handles = {
    tl: { x: el.x, y: el.y },
    tr: { x: el.x + w, y: el.y },
    bl: { x: el.x, y: el.y + h },
    br: { x: el.x + w, y: el.y + h },
  };

  for (let key in handles) {
    const hnd = handles[key];
    if (
      mouse.x >= hnd.x - size &&
      mouse.x <= hnd.x + size &&
      mouse.y >= hnd.y - size &&
      mouse.y <= hnd.y + size
    ) {
      return key;
    }
  }

  return null;
}

function startEditingText(el) {
  textEditing.active = true;
  textEditing.element = el;
  textEditing.cursorPos = el.text.length;

  selectedElement = el;
}

function stopEditingText() {
  textEditing.active = false;
  textEditing.element = null;
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
        let w = el.w;
        let h = el.h;

        if (el.type === "text") {
          const bounds = getTextBounds(el);
          w = bounds.w;
          h = bounds.h;
        }

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2 / camera.zoom;
        ctx.strokeRect(el.x, el.y, w, h);

        drawHandles({ x: el.x, y: el.y, w, h });
      }
    }

    if (el.type === "image") {
      const img = new Image();
      img.src = el.src;

      ctx.drawImage(img, el.x, el.y, el.w, el.h);

      if (selectedElement === el) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2 / camera.zoom;
        ctx.strokeRect(el.x, el.y, el.w, el.h);

        drawHandles(el);
      }
    }

    if (
      textEditing.active &&
      textEditing.element === el &&
      textEditing.selectAll
    ) {
      const bounds = getTextBounds(el);

      ctx.fillStyle = "rgba(100, 150, 255, 0.3)";
      ctx.fillRect(el.x, el.y, bounds.w, bounds.h);
    }

    if (el.type === "text") {
      ctx.fillStyle = el.style.color;
      ctx.font = `${el.style.fontSize}px ${el.style.fontFamily}`;

      const lines = el.text.split("\n");

      lines.forEach((line, i) => {
        ctx.fillText(line, el.x, el.y + i * el.style.fontSize);
      });

      // 🔥 CURSOR RENDERING (Step 4 goes HERE)
      if (textEditing.active && textEditing.element === el) {
        const beforeCursor = el.text.slice(0, textEditing.cursorPos);
        const split = beforeCursor.split("\n");

        const currentLine = split[split.length - 1];
        const cursorX = el.x + ctx.measureText(currentLine).width;
        const cursorY = el.y + (split.length - 1) * el.style.fontSize;

        const time = Date.now();
        if (Math.floor(time / 500) % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(cursorX, cursorY - el.style.fontSize);
          ctx.lineTo(cursorX, cursorY + 4);
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
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
