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

let nextId = 2;

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

// Mouse + input state
let isPanning = false;
let spacePressed = false;
let lastMouse = { x: 0, y: 0 };

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
      isDragging = true;

      dragOffset.x = mouse.x - el.x;
      dragOffset.y = mouse.y - el.y;

      break;
    }
  }
});

// Mouse up → stop panning
window.addEventListener("mouseup", () => {
  isPanning = false;
  isDragging = false;
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

  if (isDragging && selectedElement) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    selectedElement.x = mouse.x - dragOffset.x;
    selectedElement.y = mouse.y - dragOffset.y;
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

  const newElement = {
    id: nextId++,
    type: "rect",
    x: mouse.x - 75,
    y: mouse.y - 50,
    w: 150,
    h: 100,
    color: randomColor(),
  };

  elements.push(newElement);

  // Auto select + start dragging (feels smooth)
  selectedElement = newElement;
  isDragging = true;

  dragOffset.x = 75;
  dragOffset.y = 50;
});

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
