import { state } from "../state.js";

export function drawGrid(ctx, canvas) {
  const size = 50;

  ctx.strokeStyle = "#222";

  const startX = Math.floor(state.camera.x / size) * size;
  const endX = startX + canvas.width / state.camera.zoom + size;

  const startY = Math.floor(state.camera.y / size) * size;
  const endY = startY + canvas.height / state.camera.zoom + size;

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