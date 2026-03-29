export function getTextBounds(ctx, el) {
  ctx.font = `${el.style.fontSize}px ${el.style.fontFamily}`;

  const lines = el.text.split("\n");
  const width = Math.max(...lines.map(l => ctx.measureText(l).width));
  const height = lines.length * el.style.fontSize;

  return { w: width, h: height };
}