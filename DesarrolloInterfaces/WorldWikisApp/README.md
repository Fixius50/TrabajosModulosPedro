# WorldWikisApp (React Refactor)

This project has been refactored from a static HTML/Vue file to a modern React + Vite application.

## Prerequisites

- Node.js (v14 or higher)

## Setup & Run

1.  Open a terminal in this folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open the URL shown in the terminal (usually `http://localhost:5173`).

## Structure

- `src/main.jsx`: Entry point.
- `src/App.jsx`: Main state and layout logic.
- `src/components/`:
    - `Sidebar.jsx`: Entity management.
    - `MapCanvas.jsx`: Visual editor.
    - `WikiView.jsx`: Generated documentation.
- `src/index.css`: Global styles (Dark Mode).
