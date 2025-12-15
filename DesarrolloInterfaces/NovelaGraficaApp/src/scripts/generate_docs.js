
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');
const historyPath = path.join(projectRoot, '_historial_proyecto.md');
const docPath = path.join(projectRoot, 'Documentacion/Documentación.html');
const archivePath = path.join('C:/Users/Roberto/Desktop/TrabajosModulosPedro/Documentaciones/NovelaGraficaApp/Documentación.html');

// Create Documentacion folder if not exists
if (!fs.existsSync(path.dirname(docPath))) {
    fs.mkdirSync(path.dirname(docPath), { recursive: true });
}

// Ensure Archive folder exists
if (!fs.existsSync(path.dirname(archivePath))) {
    fs.mkdirSync(path.dirname(archivePath), { recursive: true });
}

const historyContent = fs.existsSync(historyPath) ? fs.readFileSync(historyPath, 'utf-8') : "No history found.";

const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentación - Novela Gráfica App</title>
    <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 2rem; background: #f4f4f5; color: #18181b; }
        .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
        h2 { margin-top: 2rem; color: #1f2937; }
        pre { background: #18181b; color: #e5e7eb; padding: 1rem; border-radius: 6px; overflow-x: auto; }
        code { font-family: Menlo, Monaco, Consolas, monospace; }
        .badge { display: inline-block; padding: 0.25rem 0.5rem; background: #e0e7ff; color: #4338ca; border-radius: 4px; font-size: 0.875rem; font-weight: 600; margin-right: 0.5rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Novela Gráfica App - Documentación Técnica</h1>
        <p><strong>Última Actualización:</strong> ${new Date().toLocaleString()}</p>
        
        <h2>Resumen del Proyecto</h2>
        <p>Una aplicación de Novela Visual Interactiva creada con React, Vite y Supabase. Cuenta con un motor de decisiones, sistema de inventario, consecuencias persistentes y soporte para historias basadas en JSON.</p>
        
        <div>
            <span class="badge">React</span>
            <span class="badge">Vite</span>
            <span class="badge">Supabase</span>
            <span class="badge">TailwindCSS</span>
            <span class="badge">Framer Motion</span>
            <span class="badge">JSON Engine</span>
        </div>

        <h2>Historial de Desarrollo y Prompts</h2>
        <pre>${historyContent}</pre>
        
        <h2>Arquitectura (JSON Engine Update)</h2>
        <ul>
            <li><strong>StoryLoader</strong>: Servicio de carga de historias desde <code>/public/assets</code>.</li>
            <li><strong>useStoryEngine</strong>: Hook híbrido (DB + JSON).</li>
            <li><strong>VisualNovelCanvas</strong>: UI reactiva con burbujas de cómic.</li>
            <li><strong>Neural Map</strong>: Navegación visual del árbol de decisiones.</li>
        </ul>
    </div>
</body>
</html>
`;

fs.writeFileSync(docPath, htmlContent);
console.log(`Documentación generada en: ${docPath}`);

try {
    fs.writeFileSync(archivePath, htmlContent);
    console.log(`Documentación archivada en: ${archivePath}`);
} catch (err) {
    console.error(`Error archivando: ${err.message}`);
}
