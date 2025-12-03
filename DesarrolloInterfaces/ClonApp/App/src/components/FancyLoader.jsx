import React from 'react';
import { motion } from 'framer-motion';

const FancyLoader = () => (
    <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative w-16 h-16">
            <motion.div
                className="absolute inset-0 border-4 border-zinc-200 rounded-full"
            />
            <motion.div
                className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute inset-4 bg-zinc-100 rounded-full flex items-center justify-center text-xl"
                animate={{ scale: [1, 0.9, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                ✨
            </motion.div>
        </div>
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-zinc-500 font-medium"
        >
            Cargando contenido...
        </motion.p>
    </div>
);

export default FancyLoader;
