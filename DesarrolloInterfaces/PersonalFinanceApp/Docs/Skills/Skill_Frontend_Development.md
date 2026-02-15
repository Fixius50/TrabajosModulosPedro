# Skill: Desarrollo Frontend (React + TS + Tailwind)

## Descripción

Estándares y mejores prácticas para el desarrollo de componentes de interfaz en la Personal Finance App.

## Reglas Maestras

1. **Componentes Funcionales**: Siempre usar componentes funcionales con Hooks.
2. **TypeScript Estricto**: Definir interfaces para todas las `props` y estados complejos. Evitar `any` a toda costa.
3. **Tailwind CSS**: Usar clases de utilidad para el estilizado.
    - Evitar estilos en línea (`style={{...}}`) salvo para valores dinámicos calculados.
    - Usar `className` con template literals para clases condicionales: `` `btn ${isActive ? 'btn-active' : ''}` ``.
4. **Estructura de Carpetas**:
    - `src/components/`: Componentes reutilizables agnósticos (Botones, Inputs).
    - `src/features/[feature_name]/`: Componentes específicos de dominio (ej: `fantasy/DebtTracker.tsx`).
5. **Hooks Personalizados**: Extraer lógica compleja a `src/hooks/` (ej: `useAuth`, `useGamification`).

## Snippet de Componente Base

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
    title: string;
    isActive?: boolean;
}

export default function FantasyComponent({ title, isActive = false }: Props) {
    const navigate = useNavigate();
    const [localState, setLocalState] = useState<string>('');

    // Efectos
    useEffect(() => {
        // Lógica de montaje
    }, []);

    return (
        <div className={`p-4 rounded-xl border ${isActive ? 'border-primary' : 'border-stone-800'}`}>
            <h2 className="text-xl font-display text-primary">{title}</h2>
            {/* Contenido */}
        </div>
    );
}
```
