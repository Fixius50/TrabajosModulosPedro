import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // Configuración CORS estándar
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Nombre del archivo desde la URL (ej: ?filename=foto.png)
    const filename = req.query.filename || `upload-${Date.now()}`;

    // 1. Subida real a Vercel Blob
    // Vercel inyecta automáticamente BLOB_READ_WRITE_TOKEN si creaste el Storage
    const blob = await put(filename, req.body, {
      access: 'public',
    });

    // 2. Devolver la URL pública
    return res.status(200).json(blob);

  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ error: 'Error subiendo archivo', details: error.message });
  }
}