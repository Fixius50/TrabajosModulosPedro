# Plan de Reestructuración y Rediseño

## User Review Required
>
> [!CAUTION]
> **DESTRUCTIVE ACTION:** Sorting files by extension (e.g., all `.tsx` in one folder, `.css` in another) destroys the component/feature module structure.
> **Build Status:** The application WILL NOT BUILD immediately after this operation. All import paths will be broken.
> **Refactoring:** Extensive refactoring will be required to update import paths (e.g., changing `import App from './App'` to `import App from '../tsx/App'`).

## Proposed Changes

### 1. Extension-Based Sorting

Files within `resources/frontend` and `resources/backend` will be flattened and sorted into subdirectories based on their extension.

#### Target Structure (`resources/frontend`)

```text
resources/frontend/
├── tsx/        # All .tsx files
├── ts/         # All .ts files
├── css/        # All .css files
├── html/       # .html files
├── json/       # .json files
├── svgs/       # .svg and other assets
└── ...
```

#### Target Structure (`resources/backend`)

```text
resources/backend/
├── sql/        # .sql files
├── ts/         # .ts files (functions)
└── ...
```

### 2. Execution Steps

1. **Inventory**: List all files recursively in target directories.
2. **Create Folders**: Generate folders for each found extension.
3. **Move**: Move files to their corresponding extension folder.
4. **Cleanup**: Remove empty original directories (e.g., `src/components`, `src/pages`).

## Verification Plan

- Verify all files are moved.
- Acknowledge broken build state.
- (Future) Begin refactoring imports.

### 3. Redesign Implementation (El Prisma del Patrimonio Híbrido)

> [!IMPORTANT]
> The redesign will apply the aesthetic defined in `design_system.md`. This requires installing TailwindCSS if not present and refactoring core layout components.

#### 3.1 Dependencies & Configuration

- [ ] Install **TailwindCSS** and required plugins (`forms`, `container-queries`).
- [ ] Update **Google Fonts**: Add `Newsreader` and `JetBrains Mono`.
- [ ] Configure `tailwind.config.ts`:
  - Add custom colors (`primary`, `electric-cyan`, etc.)
  - Add custom font families (`display`, `technical`).

#### 3.2 Global Styles (`index.css`)

- [ ] Define CSS variables for root colors (`--gold`, `--cyan`, etc.).
- [ ] Implement global background gradients (`radial-gradient`).
- [ ] Add utility classes for "Zen Card" (glassmorphism) and "Data Fractal".

#### 3.3 Layout Refactoring

- [ ] Create/Update `Layout.tsx` (or `App.tsx`) to use the new "Nav Rune" navigation bar style.
- [ ] Implement the "Ticker Bar" at the bottom of the screen.
- [ ] Update the Dashboard view to match the "Prisma" circular visualization.
