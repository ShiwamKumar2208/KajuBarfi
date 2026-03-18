const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Camera (infinite canvas)
let camera = {
  x: 0,
  y: 0,
  zoom: 1
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
  if (e.button === 1 || spacePressed) {
    isPanning = true;
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
  }
});

// Mouse up → stop panning
window.addEventListener("mouseup", () => {
  isPanning = false;
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

// Draw loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  // Apply camera transform
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  drawGrid();

  ctx.restore();

  requestAnimationFrame(draw);
}

// Grid
function drawGrid() {
  const size = 50;

  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;

  const startX = Math.floor(camera.x / size) * size;
  const endX = startX + (canvas.width / camera.zoom) + size;

  const startY = Math.floor(camera.y / size) * size;
  const endY = startY + (canvas.height / camera.zoom) + size;

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