import React from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export function SpotlightCard({ children, className = "", onClick }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }
    return (
        <div className={clsx("group relative border border-zinc-200 bg-white overflow-hidden rounded-xl", className)} onMouseMove={handleMouseMove} onClick={onClick}>
            <motion.div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(79, 70, 229, 0.1), transparent 80%)` }} />
            <div className="relative h-full">{children}</div>
        </div>
    );
}

export const FancyText = ({ text, className }) => {
    const words = text.split(" ");
    return (
        <div className={className}>
            {words.map((word, i) => (<motion.span key={i} initial={{ opacity: 0, y: 10, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.4, delay: i * 0.1 }} className="inline-block mr-2">{word}</motion.span>))}
        </div>
    );
};

export const FancyTabs = ({ tabs, activeTab, onTabChange }) => (
    <div className="flex space-x-1 border-b border-zinc-200 px-6 pt-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
            <button key={tab.id} onClick={() => onTabChange(tab.id)} className={clsx("relative px-4 py-2 text-sm font-medium transition-colors outline-none whitespace-nowrap", activeTab === tab.id ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700")}>
                {activeTab === tab.id && <motion.div layoutId="active-pill" className="absolute inset-0 border-b-2 border-zinc-900" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                <span className="relative z-10">{tab.label}</span>
            </button>
        ))}
    </div>
);

export const Modal = ({ isOpen, onClose, title, children, transparent = false, className = "max-w-lg" }) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={clsx("fixed inset-0 m-auto h-fit max-h-[85vh] z-[70] w-full rounded-xl shadow-2xl overflow-hidden flex flex-col", transparent ? "bg-transparent shadow-none" : "bg-white border border-zinc-200", className)}>
                        {title && <div className="flex justify-between items-center p-4 border-b border-zinc-100 shrink-0 bg-white"><h2 className="text-sm font-semibold text-zinc-700">{title}</h2><button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-600 transition-colors"><X size={18} /></button></div>}
                        <div className="flex-1 overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
