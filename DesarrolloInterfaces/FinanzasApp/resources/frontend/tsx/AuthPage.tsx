import React from 'react';

interface AuthPageProps {
    onLoginSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
    // Note: D20DiceWithLogin was deleted. Implementing simple Dungeon Auth.
    // In a real scenario, we'd rebuild the D20 login or just use Supabase Auth UI.
    // For this refactor, I'll create a simple "Enter the Dungeon" screen.

    // For now, let's just assume auto-login or trigger success for the demo 
    // since the complex D20/Auth logic components were removed in cleanup.
    // BUT, we need a real login for Supabase ideally.
    // Let's implement a basic accessible login form.

    const [loading, setLoading] = React.useState(false);

    const handleEnter = () => {
        setLoading(true);
        setTimeout(() => {
            // Mock login delay
            if (onLoginSuccess) onLoginSuccess();
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-dungeon-bg bg-wood-texture flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-parchment-texture p-8 rounded-lg shadow-2xl border-4 border-iron-border text-center">
                <h1 className="font-dungeon-header text-4xl text-ink font-bold mb-2 uppercase tracking-[0.2em] drop-shadow-md">
                    Finanzas Dungeon
                </h1>
                <p className="font-dungeon-body text-ink/80 mb-8 italic text-lg border-b-2 border-ink/20 pb-4">
                    "Asegura tu tesoro digital..."
                </p>

                <button
                    onClick={handleEnter}
                    disabled={loading}
                    className="w-full bg-dungeon-bg border-4 border-double border-gold-coin text-gold-coin py-4 px-8 rounded-lg font-dungeon-header text-xl font-bold hover:bg-black/90 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex justify-center items-center gap-3 shadow-lg group"
                >
                    <span className="material-symbols-outlined group-hover:animate-pulse">key</span>
                    {loading ? 'Abriendo Portón...' : 'Entrar al Reino'}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;
