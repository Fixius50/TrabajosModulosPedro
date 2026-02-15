import './fantasy.css';
// import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HeroHall() {
    // const { user } = useAuth(); // Not used yet
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/app');
    };

    return (
        <div className="fantasy-theme min-h-screen">
            <div className="fantasy-container stone-texture flex flex-col px-6 pt-12 pb-8 max-w-md mx-auto shadow-2xl border-x border-primary/10">

                {/* Guild Mode Toggle */}
                <div className="absolute top-8 left-6 flex items-center gap-3">
                    <div className="relative w-8 h-12 bg-black/40 border border-primary/20 rounded-md flex justify-center items-start pt-1">
                        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_#ecb613] relative z-10"></div>
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-primary/20"></div>
                    </div>
                    <span className="text-[0.625rem] uppercase tracking-widest text-primary/70 font-bold">Family Mode</span>
                </div>

                {/* Header */}
                <div className="mt-12 mb-10 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-primary drop-shadow-lg italic runic-glow">
                        Welcome Back
                    </h1>
                    <p className="text-primary/50 text-xs uppercase tracking-[0.2em] mt-2">Select Profile</p>
                </div>

                {/* Profiles */}
                <div className="space-y-4 flex-grow">
                    {[
                        { name: 'Personal', level: '04', gold: '1,240.00', active: false, img: '...' },
                        { name: 'Business', level: '12', gold: '8,430.50', active: true, img: '...' },
                        { name: 'Savings', level: 'MAX', gold: '99k+', active: false, img: '...' }
                    ].map((profile, i) => (
                        <button key={i} onClick={handleLogin} className="w-full text-left group transition-all active:scale-95">
                            <div className={`relative rounded-xl p-4 flex items-center gap-4 card-inner-shadow transition-colors ${profile.active ? 'bg-primary/5 border-2 border-primary/60' : 'bg-black/40 border border-primary/20 hover:border-primary/50'}`}>
                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-primary/30 shrink-0">
                                    {/* Using placeholder images or the one from Stitch */}
                                    <div className="w-full h-full bg-stone-800 flex items-center justify-center text-4xl">
                                        {i === 0 ? '👤' : i === 1 ? '💼' : '💰'}
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-end mb-1">
                                        <h3 className="text-xl font-bold text-white/90">{profile.name}</h3>
                                    </div>
                                    <div className="w-full h-1.5 bg-black/60 rounded-full mb-3 overflow-hidden border border-white/5">
                                        <div className="bg-primary h-full shadow-[0_0_8px_#ecb613]" style={{ width: profile.active ? '65%' : '20%' }}></div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-icons text-primary text-sm">monetization_on</span>
                                        <span className="text-sm font-medium text-primary/80">€{profile.gold}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Biometric Rune */}
                <div className="mt-8 flex justify-center">
                    <button onClick={handleLogin} className="group relative w-20 h-20 rounded-full bg-black/60 border border-primary/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 border border-primary/50 rounded-full animate-spin-slow opacity-60"></div>
                        <span className="material-icons text-3xl text-primary rune-glow group-hover:text-white transition-colors">fingerprint</span>
                    </button>
                    <p className="absolute bottom-10 text-[0.625rem] text-primary/40 uppercase tracking-widest animate-pulse">Touch ID</p>
                </div>

            </div>
        </div>
    );
}
