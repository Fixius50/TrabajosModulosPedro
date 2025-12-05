import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
  // Fallback for public repos if no token (rate limits apply but works for demo)
  const octokit = new Octokit(GITHUB_TOKEN ? { auth: GITHUB_TOKEN } : {});

  const OWNER = "Fixius50";
  const REPO = "TrabajosModulosPedro";
  const BASE_PATH = "DesarrolloInterfaces/ClonApp/App/assets";

  try {
    const fetchFolder = async (folder, type) => {
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner: OWNER,
          repo: REPO,
          path: `${BASE_PATH}/${folder}`
        });

        if (!Array.isArray(data)) return [];

        return data.map(file => ({
          id: file.sha,
          name: file.name.split('.')[0].replace(/-/g, ' '),
          author: 'Fixius50',
          download_url: file.download_url,
          preview: type === 'font' ? 'Aa' : type === 'icon' ? '📦' : file.download_url,
          type: type
        }));
      } catch (e) {
        console.error(`Error fetching ${folder}:`, e);
        return [];
      }
    };

    const [styles, icons, fonts] = await Promise.all([
      fetchFolder('themesApp', 'theme'),
      fetchFolder('iconsApp', 'icon'),
      fetchFolder('tipographyApp', 'font')
    ]);

    // Enhance styles with metadata if possible, or default colors
    const enhancedStyles = styles.map(s => ({
      ...s,
      colors: { bg: '#f4f4f5', text: '#18181b' }
    }));

    const marketData = {
      styles: enhancedStyles,
      icons,
      fonts,
      templates: [
        { id: 'tmpl-marketing', name: 'Plan de Marketing', icon: '📈', description: 'Estrategia completa para Q4', blocks: [{ id: 'b1', type: 'h1', content: 'Plan de Marketing' }, { id: 'b2', type: 'todo', content: 'Definir KPIs', checked: false }] },
        { id: 'tmpl-journal', name: 'Diario Personal', icon: '📔', description: 'Plantilla para reflexiones diarias', blocks: [{ id: 'b1', type: 'h1', content: 'Diario' }, { id: 'b2', type: 'p', content: 'Hoy me siento...' }] }
      ],
      covers: [
        { id: 'cover-nature', name: 'Nature Pack', author: 'Unsplash', count: 12, preview: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=100&h=100&fit=crop' },
        { id: 'cover-arch', name: 'Architecture', author: 'ArchDaily', count: 8, preview: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop' }
      ]
    };

    res.status(200).json(marketData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error connecting to Marketplace API' });
  }
}