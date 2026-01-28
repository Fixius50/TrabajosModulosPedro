import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { wallet, trendingUp, receipt, storefront } from 'ionicons/icons';

interface OracleSyncProps {
    onComplete?: () => void;
}

const OracleSync: React.FC<OracleSyncProps> = ({ onComplete }) => {
    const [status, setStatus] = useState("INICIANDO RITUAL DE CONEXIÓN...");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const steps = [
            { txt: "DETECTANDO ARCAS REALES...", time: 1000 },
            { txt: "VINCULANDO CON EL ORÁCULO FINANCIERO...", time: 2500 },
            { txt: "EXTRAYENDO FLUJO DE DATOS DEL SANTUARIO...", time: 4000 },
            { txt: "MATERIALIZANDO ACTIVOS...", time: 5500 },
            { txt: "COMPLETADO", time: 6500 }
        ];

        let currentStep = 0;

        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                setStatus(steps[currentStep].txt);
                setProgress((prev) => prev + 20);
                currentStep++;
            } else {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, 1200);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#050404] flex flex-col items-center justify-center overflow-hidden font-[Cinzel]">

            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(#4a0404 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
            </div>

            {/* Top Left Branding */}
            <div className="absolute top-8 left-8 flex items-center gap-3 opacity-50">
                <div className="w-8 h-8 bg-[#8a1c1c] rotate-45"></div>
                <span className="text-white tracking-[0.3em] font-bold">EL ASTROLABIO</span>
            </div>

            {/* Main Ritual Circle */}
            <div className="relative w-[600px] h-[600px] flex items-center justify-center">

                {/* Rotating Rings */}
                <div className="absolute inset-0 border border-[#8a1c1c]/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-[50px] border border-[#8a1c1c]/40 rounded-full animate-[spin_15s_linear_infinite_reverse] border-dashed"></div>
                <div className="absolute inset-[100px] border-2 border-[#8a1c1c] rounded-full opacity-20 animate-pulse"></div>

                {/* Connecting Lines to Satellites (Static for now, could be animated SVGs) */}
                <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#8a1c1c]/50 to-transparent rotate-0"></div>
                <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#8a1c1c]/50 to-transparent rotate-90"></div>

                {/* Satellites */}
                {/* Top Left: Ahorro */}
                <div className="absolute top-0 left-[15%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 border border-[#8a1c1c] bg-black/50 rounded-xl flex items-center justify-center shadow-[0_0_15px_#8a1c1c] group-hover:scale-110 transition-transform">
                        <IonIcon icon={wallet} className="text-[#c5a059] text-2xl" />
                    </div>
                    <span className="text-[#c5a059] text-[10px] tracking-widest uppercase">Ahorro</span>
                </div>

                {/* Top Right: Inversión */}
                <div className="absolute top-[15%] right-0 translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 border border-[#8a1c1c] bg-black/50 rounded-xl flex items-center justify-center shadow-[0_0_15px_#8a1c1c] group-hover:scale-110 transition-transform">
                        <IonIcon icon={trendingUp} className="text-[#c5a059] text-2xl" />
                    </div>
                    <span className="text-[#c5a059] text-[10px] tracking-widest uppercase">Inversión</span>
                </div>

                {/* Bottom Left: Gastos */}
                <div className="absolute bottom-[15%] left-0 -translate-x-1/2 translate-y-1/2 flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 border border-[#8a1c1c] bg-black/50 rounded-xl flex items-center justify-center shadow-[0_0_15px_#8a1c1c] group-hover:scale-110 transition-transform">
                        <IonIcon icon={receipt} className="text-[#c5a059] text-2xl" />
                    </div>
                    <span className="text-[#c5a059] text-[10px] tracking-widest uppercase">Gastos</span>
                </div>

                {/* Bottom Right: Patrimonio */}
                <div className="absolute bottom-0 right-[15%] translate-x-1/2 translate-y-1/2 flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 border border-[#8a1c1c] bg-black/50 rounded-xl flex items-center justify-center shadow-[0_0_15px_#8a1c1c] group-hover:scale-110 transition-transform">
                        <IonIcon icon={storefront} className="text-[#c5a059] text-2xl" />
                    </div>
                    <span className="text-[#c5a059] text-[10px] tracking-widest uppercase">Patrimonio</span>
                </div>

                {/* Central Avatar */}
                <div className="relative z-10 w-32 h-32 rounded-full border-4 border-[#8a1c1c] overflow-hidden shadow-[0_0_50px_#8a1c1c]">
                    <img src="https://i.pravatar.cc/300" alt="Avatar" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-[#8a1c1c]/30 animate-pulse"></div>
                </div>

                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="28" fill="none" stroke="#333" strokeWidth="2" />
                    <circle cx="50" cy="50" r="28" fill="none" stroke="#8a1c1c" strokeWidth="2"
                        strokeDasharray="175" strokeDashoffset={175 - (175 * progress) / 100}
                        className="transition-all duration-500 ease-out"
                    />
                </svg>

            </div>

            {/* Status Text */}
            <div className="mt-16 text-center z-10">
                <h2 className="text-3xl text-white font-bold mb-2 tracking-tighter">
                    Sincronizando con el <span className="text-[#8a1c1c]">Oráculo Financiero...</span>
                </h2>
                <div className="flex items-center justify-center gap-4 text-[#c5a059]/80 text-sm tracking-widest uppercase">
                    <span className="h-[1px] w-12 bg-[#c5a059]/40"></span>
                    {status}
                    <span className="h-[1px] w-12 bg-[#c5a059]/40"></span>
                </div>
            </div>

            {/* Bottom Status */}
            <div className="absolute bottom-8 left-8 text-[#8a1c1c] text-[10px] tracking-[0.3em] flex gap-2">
                <span className="animate-pulse">●</span> ESTADO DEL RITUAL
            </div>

            <div className="absolute bottom-8 right-8 text-white/20 text-xs italic">
                "La esencia de tus activos se está materializando..."
            </div>

        </div>
    );
};

export default OracleSync;
