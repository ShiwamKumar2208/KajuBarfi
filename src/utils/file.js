import { state } from "../state.js";

function cleanElements(elements) {
  return JSON.parse(
    JSON.stringify(elements, (key, value) => {
      if (key === "img") return undefined;
      return value;
    })
  );
}

export function saveFile(name = "board.kj") {
  const finalName = name.endsWith(".kj") ? name : name + ".kj";

  const data = JSON.stringify({
    elements: cleanElements(state.elements),
    camera: state.camera,
  });

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = finalName;
  a.click();

  URL.revokeObjectURL(url);
}