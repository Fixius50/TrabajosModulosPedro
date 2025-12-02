import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Configuración de CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 1. Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Falta el header de autorización' });
    }

    // El formato debe ser "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');

    try {
        // 2. Inicializar Supabase en el contexto del SERVIDOR
        // Usamos las variables de entorno de Vercel (SUPABASE_URL, SUPABASE_ANON_KEY)
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Variables de entorno de Supabase no configuradas en el servidor.");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 3. Validar el token con Supabase Auth
        // getUser() verifica la firma del JWT y obtiene los datos del usuario
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Token inválido o expirado', details: error?.message });
        }

        // 4. Si todo es correcto, devolvemos datos protegidos
        // Aquí podrías consultar tu base de datos usando el user.id
        res.status(200).json({
            message: 'Autenticación exitosa',
            user: {
                id: user.id,
                email: user.email,
                providers: user.app_metadata.providers,
                last_sign_in: user.last_sign_in_at
            }
        });

    } catch (err) {
        console.error("Error en api/user-data:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}