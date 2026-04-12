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
  window.updateQuickActions?.();

  ctx.restore();

  // TODO: Add screen magnifier

  // ================= TRAIL =================

  if (state.trailEnabled) {
    ctx.save(); // 🔥 isolate effect

    ctx.shadowBlur = 20;
    ctx.shadowColor = "white";

    state.trail.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.life})`;
      ctx.fill();

      p.life -= 0.03;
    });

    ctx.restore(); // 🔥 reset everything cleanly

    state.trail = state.trail.filter(p => p.life > 0);
  }

  requestAnimationFrame(() => draw(ctx, canvas));
}