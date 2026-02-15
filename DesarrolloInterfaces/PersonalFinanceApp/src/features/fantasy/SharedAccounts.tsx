import { useState, useEffect } from 'react';
import './fantasy.css';
import { useNavigate } from 'react-router-dom';
import { storageService, type GuildMember, type Tithe } from '../../services/storageService';

export default function SharedAccounts() {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [members, setMembers] = useState<GuildMember[]>([]);
    const [tithes, setTithes] = useState<Tithe[]>([]);

    useEffect(() => {
        const data = storageService.getGuildData();
        setBalance(data.balance);
        setMembers(data.members);
        setTithes(data.tithes);
    }, []);

    return (
        <div className="font-display text-primary/90 bg-[#221e10] min-h-screen flex justify-center items-center overflow-hidden relative selection:bg-primary/30">
            {/* Atmospheric Background */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-[#221e10] via-[#221e10]/80 to-transparent"></div>
            </div>

            {/* Mobile Container */}
            <div className="relative w-full max-w-[24.375rem] h-[52.75rem] bg-[#221e10] overflow-hidden shadow-2xl border-4 border-[#3a3628] flex flex-col items-center rounded-3xl">

                {/* Header */}
                <header className="relative z-10 w-full px-6 pt-12 pb-4 flex justify-between items-center border-b border-primary/10 bg-[#221e10]/90 backdrop-blur-sm">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-lg border border-primary/20 bg-stone-900/50 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                    >
                        <span className="material-icons">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-primary/90">Guild Vault</h1>
                    <button className="w-10 h-10 rounded-full bg-stone-800/50 flex items-center justify-center border border-primary/10">
                        <span className="material-icons text-primary/60">settings</span>
                    </button>
                </header>

                {/* Content */}
                <main className="relative z-10 flex-1 w-full overflow-y-auto no-scrollbar px-6 pb-20">

                    {/* Vault Chest Section */}
                    <div className="relative py-10 flex flex-col items-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-[3.75rem]"></div>

                        <div className="relative z-10 mb-6 group">
                            <div className="w-32 h-32 rounded-3xl bg-[#16140d] border-2 border-primary/30 flex items-center justify-center shadow-2xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
                                <span className="material-icons text-6xl text-primary drop-shadow-[0_0_0.9375rem_rgba(244,192,37,0.6)]">inventory_2</span>
                            </div>
                            {/* Decorative corners */}
                            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary/60 rounded-tl"></div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary/60 rounded-tr"></div>
                            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary/60 rounded-bl"></div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary/60 rounded-br"></div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-4xl font-black tracking-wider text-primary drop-shadow-lg">
                                {balance.toLocaleString()} <span className="text-lg align-top opacity-70">GP</span>
                            </h2>
                            <p className="text-[0.625rem] uppercase tracking-[0.3em] text-primary/40 mt-1 font-bold">Total Shared Wealth</p>
                        </div>
                    </div>

                    {/* Guild Members Carousel */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-xs uppercase tracking-widest text-primary/70 font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                Guild Members
                            </h3>
                            <button className="text-[0.625rem] text-primary/50 hover:text-primary transition-colors">Manage</button>
                        </div>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            {members.map(member => (
                                <div key={member.id} className="flex flex-col items-center gap-2 shrink-0 group">
                                    <div className="relative w-14 h-14 rounded-full border-2 border-[#3a3429] p-0.5 bg-[#16140d] group-hover:border-primary/50 transition-colors">
                                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#221e10] rounded-full flex items-center justify-center border border-primary/20">
                                            <span className="material-icons text-[0.625rem] text-primary">
                                                {member.role === 'Leader' ? 'emoji_events' : 'shield'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[0.625rem] text-primary/60 font-medium group-hover:text-primary transition-colors">{member.name}</span>
                                </div>
                            ))}
                            <button className="flex flex-col items-center gap-2 shrink-0 group">
                                <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#3a3429] flex items-center justify-center bg-[#16140d]/50 group-hover:border-primary/30 transition-colors">
                                    <span className="material-icons text-primary/30 group-hover:text-primary/60">add</span>
                                </div>
                                <span className="text-[0.625rem] text-primary/30 font-medium group-hover:text-primary/60">Invite</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Tithes */}
                    <div>
                        <h3 className="text-xs uppercase tracking-widest text-primary/70 font-bold flex items-center gap-2 mb-4">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            Recent Tithes
                        </h3>
                        <div className="space-y-3">
                            {tithes.map(tithe => {
                                const member = members.find(m => m.id === tithe.memberId);
                                return (
                                    <div key={tithe.id} className="bg-[#1c1912] border border-primary/5 rounded-xl p-3 flex items-center gap-3 hover:border-primary/20 transition-colors">
                                        <div className="w-10 h-10 rounded bg-[#221e10] flex items-center justify-center border border-primary/10">
                                            <span className="material-icons text-primary/60 text-lg">savings</span>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="text-sm font-bold text-primary/90 truncate">{member?.name}</h4>
                                                <span className="text-emerald-500 font-bold text-sm">+ {tithe.amount} GP</span>
                                            </div>
                                            <div className="flex justify-between items-baseline mt-0.5">
                                                <p className="text-[0.625rem] text-primary/40 truncate">{tithe.note}</p>
                                                <span className="text-[0.625rem] text-primary/30">{tithe.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </main>

                {/* Bottom Action */}
                <div className="absolute bottom-6 left-0 right-0 px-6 z-20">
                    <button className="w-full py-4 bg-gradient-to-r from-[#3a3429] to-[#2e2920] rounded-xl border border-primary/20 text-primary font-bold tracking-widest uppercase shadow-lg flex items-center justify-center gap-2 hover:from-[#4a4335] hover:to-[#3a3429] transition-all active:scale-[0.98]">
                        <span className="material-icons">vpn_key</span>
                        Expand Vault
                    </button>
                </div>

            </div>
        </div>
    );
}
