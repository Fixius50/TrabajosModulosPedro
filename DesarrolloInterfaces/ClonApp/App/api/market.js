import { Octokit } from "@octokit/rest";
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Configuración CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // El token se lee del servidor (Vercel), NO del cliente
  const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Server configuration error: Missing GitHub Token' });
  }

  try {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // Hardcodeamos tus rutas para mayor seguridad
    const OWNER = "Fixius50";
    const REPO = "TrabajosModulosPedro";
    const PATH = "DesarrolloInterfaces/ClonApp/App";

    // Obtener el contenido raíz
    const { data: rootContents } = await octokit.rest.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: PATH
    });

    // Aquí podrías filtrar y procesar los datos antes de enviarlos al front
    // Para simplificar, enviamos la estructura cruda o una simplificada
    // Nota: En un caso real, aquí haríamos el bucle para obtener subcarpetas
    // pero por rendimiento, quizás sea mejor devolver solo la raíz y que el front pida detalles,
    // o hacer todo el barrido aquí (puede tardar unos segundos).

    // Simularemos el barrido rápido para Estilos y Fuentes
    let marketData = { styles: [], fonts: [], covers: {} };

    // Lógica simplificada de tu fetchMarketData original pero en servidor
    for (const item of rootContents) {
      if (item.type === 'dir') {
        if (item.name === 'stylessApp') {
          const { data: files } = await octokit.rest.repos.getContent({ owner: OWNER, repo: REPO, path: item.path });
          for (const f of files) if (f.name.match(/\.(css|json)$/i)) marketData.styles.push({ id: f.sha, name: f.name.replace(/\.(css|json)$/, ''), author: 'Fixius50', color: 'bg-zinc-100', download_url: f.download_url });
        }
        // ... Añadir lógica de fuentes y covers si es necesario
      }
    }

    res.status(200).json(marketData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error conectando con GitHub Marketplace' });
  }
}