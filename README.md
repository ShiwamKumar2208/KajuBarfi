# 🍬 Kaju Barfi — Infinite Canvas App

A fast, local-first infinite canvas for sketching, designing, and organizing ideas with zero limits and full control.

---

## ✨ Features

* 🖥️ Infinite canvas with smooth pan & zoom
* 🧱 Rectangle elements
* 🔤 Text editing (custom engine, no HTML textarea)
* 🖼️ Image support (drag & drop + paste)
* ✏️ Sketch tool (freehand drawing)
* 🧠 Multiselect (drag to select multiple elements)
* 🔁 Undo / Redo system
* 💾 Save / Load (`.kj` custom format)
* 📤 Export canvas as PNG
* 🎯 Keyboard-driven workflow

---

## 🚀 Getting Started

### Run Online

Just open `kajubarfi.netlify.app` in your browser.

### Run locally

Just open `index.html` in your browser.

No dependencies. No build tools.

---

## 🧰 Tools

| Tool      | Shortcut | Description                              |
| --------- | -------- | ---------------------------------------- |
| Select    | `V`      | Select, move, and interact with elements |
| Rectangle | `R`      | Draw rectangles                          |
| Text      | `T`      | Create and edit text                     |
| Sketch    | `S`      | Freehand drawing                         |

---

## 🎮 Controls

### 🖱️ Mouse

* Click → select element
* Drag → move element
* Drag empty space → multiselect
* Middle click / Space + drag → pan
* Scroll → zoom

---

### ⌨️ Keyboard

#### General

* `Ctrl + S` → Save
* `Ctrl + Shift + S` → Save As
* `Ctrl + O` → Load
* `Ctrl + E` → Export PNG

#### Editing

* `Ctrl + Z` → Undo
* `Ctrl + Y` → Redo
* `Delete` → Delete selected element
* `Ctrl + D` → Duplicate

#### Text Editing

* `Ctrl + A` → Select all text
* `Ctrl + C` → Copy
* `Ctrl + X` → Cut
* `Ctrl + V` → Paste
* `Enter` → New line
* `Esc` → Exit text mode

#### Movement

* `Ctrl + I/J/K/L` → Move text precisely

---

## 💾 File System

### `.kj` Format

Custom JSON-based format storing:

* Elements (text, shapes, images, sketches)
* Canvas state (position, zoom)

---

## 🧠 Architecture

* Canvas-based rendering engine
* Element-driven system (rect, text, image, sketch)
* Snapshot-based undo/redo
* Local-first design (no backend)
* Custom text editing system

---

## ⚠️ Known Limitations

* No partial text selection
* No group resize (yet)
* Highlighting text do have some glitches
* No layers panel
* Browser cannot overwrite saved files (download limitation)

---

## 🛣️ Roadmap

* Group transformations
* Arrow/link connections
* Snap to grid
* UI polish
* Desktop version (Tauri)

---

## 🤝 Contributing

Contributions are welcome!

### How to contribute

1. Fork the repo
2. Create a new branch (`feature/your-feature`)
3. Make changes
4. Commit clearly
5. Open a pull request

---

## 💡 Development Philosophy (KISS)

* Keep it fast
* Keep it simple
* Avoid unnecessary dependencies
* Build for real usage, not just features

---

## 🔥 Final Note

This project is built from scratch to explore how real canvas-based tools work under the hood.

---
