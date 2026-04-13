let currentHandler = null;

export function setupInputModal() {
  const modal = document.getElementById("inputModal");
  const title = document.getElementById("inputModalTitle");
  const input = document.getElementById("inputField");

  const error = document.getElementById("inputError");
  const preview = document.getElementById("inputPreview");

  const closeBtn = document.getElementById("closeInputModal");
  const applyBtn = document.getElementById("applyInput");
  const cancelBtn = document.getElementById("cancelInput");

  function close() {
    modal.classList.add("hidden");
    currentHandler = null;
    input.value = "";
    error.textContent = "";
    preview.innerHTML = "";
    preview.classList.add("hidden");
  }

  closeBtn.onclick = close;
  cancelBtn.onclick = close;

  applyBtn.onclick = () => {
    if (!currentHandler) return;

    const value = input.value.trim() || input.placeholder;

    let shouldClose = true; // 🔥 assume success

    currentHandler(value, {
      setError: (msg) => {
        error.textContent = msg;
        shouldClose = false; // ❌ block closing
      },
      clearError: () => {
        error.textContent = "";
      },
      close,
    });

    // 🔥 close only if no error
    if (shouldClose) close();
  };

  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      close();
    }

    if (
      e.key === "Enter" &&
      !modal.classList.contains("hidden") &&
      document.activeElement.tagName !== "TEXTAREA"
    ) {
      applyBtn.click();
    }
  });

  // 🔥 LIVE PREVIEW (for image URLs)
  input.addEventListener("input", () => {
    const value = input.value.trim();

    preview.innerHTML = "";
    preview.classList.add("hidden");

    if (!value.startsWith("http")) return;

    const img = new Image();
    img.src = value;

    img.onload = () => {
      preview.innerHTML = "";
      preview.appendChild(img);
      preview.classList.remove("hidden");
    };
  });

  // 🔥 GLOBAL OPEN
  window.openInputModal = ({
    titleText,
    placeholder = "",
    defaultValue = "",
    onSubmit,
  }) => {
    currentHandler = onSubmit;

    title.textContent = titleText;
    input.placeholder = placeholder;
    input.value = defaultValue;

    error.textContent = "";
    preview.innerHTML = "";
    preview.classList.add("hidden");

    modal.classList.remove("hidden");

    setTimeout(() => input.focus(), 50);
  };
}
