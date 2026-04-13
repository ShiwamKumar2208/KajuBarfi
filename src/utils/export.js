import { state } from "../state.js";
import { ensureImage } from "./image.js";
import { getThemeColors } from "./settings.js";

export function exportPNG(canvas, name = "kaju.png") {
  const loading = document.getElementById("exportLoading");

  // 🔥 show loading
  loading?.classList.remove("hidden");

  // 🔥 allow UI to render BEFORE heavy work
  requestAnimationFrame(() => {
    setTimeout(() => {
      try {
        const exportCanvas = document.createElement("canvas");
        const ctx = exportCanvas.getContext("2d");

        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;

        const colors = getThemeColors();

        // background
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        ctx.save();

        ctx.scale(state.camera.zoom, state.camera.zoom);
        ctx.translate(-state.camera.x, -state.camera.y);

        state.elements.forEach((el) => {
          if (el.type === "rect") {
            ctx.fillStyle = el.color;
            ctx.fillRect(el.x, el.y, el.w, el.h);
          }

          if (el.type === "sketch") {
            ctx.strokeStyle = el.color || colors.stroke;
            ctx.lineWidth = el.width / state.camera.zoom;

            ctx.beginPath();
            el.points.forEach((p, i) => {
              if (i === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
          }

          if (el.type === "image") {
            ensureImage(el);
            if (el.img && el.img.complete) {
              ctx.drawImage(el.img, el.x, el.y, el.w, el.h);
            }
          }

          if (el.type === "text") {
            ctx.fillStyle = el.style.color || colors.text;
            ctx.textBaseline = "top";

            const fontSize = Math.max(12, el.style.fontSize || 24);
            ctx.font = `${fontSize}px ${el.style.fontFamily}`;

            const maxWidth = el.fixedWidth ? el.w : Infinity;

            function wrapText(text, maxWidth) {
              const words = text.split(" ");
              const lines = [];
              let currentLine = "";

              words.forEach((word) => {
                const test = currentLine ? currentLine + " " + word : word;
                const width = ctx.measureText(test).width;

                if (width <= maxWidth) {
                  currentLine = test;
                } else {
                  if (currentLine) lines.push(currentLine);
                  currentLine = word;
                }
              });

              if (currentLine) lines.push(currentLine);
              return lines;
            }

            const rawLines = el.text.split("\n");
            const lines = [];

            rawLines.forEach((line) => {
              lines.push(...wrapText(line, maxWidth));
            });

            lines.forEach((line, i) => {
              ctx.fillText(line, el.x, el.y + i * fontSize);
            });
          }
        });

        ctx.restore();

        const link = document.createElement("a");
        const finalName = name.endsWith(".png") ? name : name + ".png";

        link.download = finalName;
        link.href = exportCanvas.toDataURL("image/png");
        link.click();
      } catch (e) {
        // 🔥 handle tainted canvas cleanly
        window.openInputModal({
          titleText: "Export Failed",
          placeholder: "Some external images cannot be exported",
          readOnly: true,
        });
      } finally {
        // 🔥 always hide loader
        loading?.classList.add("hidden");
      }
    }, 50); // slight delay ensures spinner shows
  });
}