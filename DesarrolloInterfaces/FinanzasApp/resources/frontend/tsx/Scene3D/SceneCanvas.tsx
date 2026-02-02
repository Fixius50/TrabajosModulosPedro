// import React, { Suspense } from 'react';
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import TheVault from './TheVault.tsx';

interface SceneCanvasProps {
    className?: string;
    isTransitioning?: boolean;
    isLoading?: boolean;
}

const SceneCanvas: React.FC<SceneCanvasProps> = ({ className, isTransitioning = false, isLoading = false }) => {
    return (
        <div className={`fixed inset-0 z-0 bg-background-dark ${className}`}>
            <Canvas
                dpr={[1, 2]} // Responsiveness for mobile
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ antialias: true }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#d4af37" />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <Suspense fallback={null}>
                    <TheVault isTransitioning={isTransitioning} isLoading={isLoading} />
                </Suspense>

                {/* Restricted controls - user can look around but not fly away */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 2 - 0.5}
                    maxPolarAngle={Math.PI / 2 + 0.5}
                />
            </Canvas>
            {/* <h1 style={{color: 'white', position: 'absolute', top: '50%', left: '50%'}}>DEBUG MODE: SCENE CANVAS</h1> */}
        </div>
    );
};

export default SceneCanvas;
