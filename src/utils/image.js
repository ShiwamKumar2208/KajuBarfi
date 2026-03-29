export function ensureImage(el) {
  if (!el.img && el.src) {
    const img = new Image();
    img.src = el.src;
    el.img = img;
  }
}

export function reviveElements(elements) {
  elements.forEach(el => {
    if (el.type === "image" && el.src) {
      const img = new Image();
      img.src = el.src;
      el.img = img;
    }
  });
}