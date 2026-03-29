import { state } from "../state.js";
import { drawGrid } from "./grid.js";
import { drawElements } from "./elements.js";
import { getThemeColors } from "../utils/settings.js";

export function draw(ctx, canvas) {
  const colors = getThemeColors();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🔥 background from theme
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-state.camera.x, -state.camera.y);

  drawGrid(ctx, canvas);
  drawElements(ctx);

  ctx.restore();

  requestAnimationFrame(() => draw(ctx, canvas));
}