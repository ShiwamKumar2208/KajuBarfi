import { state } from "../state.js";
import { getSettings } from "../utils/settings.js";
import { getThemeColors } from "../utils/settings.js";

export function drawGrid(ctx, canvas) {
  const { grid } = getSettings();

  const size = 50;

  const zoom = state.camera.zoom;
  const offsetX = state.camera.x;
  const offsetY = state.camera.y;

  const colors = getThemeColors();
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1 / zoom;

  const width = canvas.width / zoom;
  const height = canvas.height / zoom;

  const startX = Math.floor(offsetX / size) * size;
  const startY = Math.floor(offsetY / size) * size;

  if (grid === "square") {
    for (let x = startX; x < offsetX + width; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x, offsetY + height);
      ctx.stroke();
    }

    for (let y = startY; y < offsetY + height; y += size) {
      ctx.beginPath();
      ctx.moveTo(offsetX, y);
      ctx.lineTo(offsetX + width, y);
      ctx.stroke();
    }
  }

  if (grid === "diamond") {
    for (let x = startX - height; x < offsetX + width + height; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x + height, offsetY + height);
      ctx.stroke();
    }

    for (let x = startX; x < offsetX + width + height; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x - height, offsetY + height);
      ctx.stroke();
    }
  }
}