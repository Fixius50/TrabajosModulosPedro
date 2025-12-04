import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, MessageSquare, MoreHorizontal, Check } from 'lucide-react';
import { clsx } from 'clsx';

// import { PageView } from './components/Views/PageView';

// Modals
// import { SearchModal } from './components/Modals/SearchModal';
// import { AIModal } from './components/Modals/AIModal';
// import { WorkspaceMenu } from './components/Modals/WorkspaceMenu';
// import { MarketplaceModal } from './components/Modals/MarketplaceModal';
// import { CreateWorkspaceModal } from './components/Modals/CreateWorkspaceModal';
// import { IconPickerModal } from './components/Modals/IconPickerModal';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, MessageSquare, MoreHorizontal, Check } from 'lucide-react';
import { clsx } from 'clsx';

// import { PageView } from './components/Views/PageView';

// Modals
// import { SearchModal } from './components/Modals/SearchModal';
// import { AIModal } from './components/Modals/AIModal';
// import { WorkspaceMenu } from './components/Modals/WorkspaceMenu';
// import { MarketplaceModal } from './components/Modals/MarketplaceModal';
// import { CreateWorkspaceModal } from './components/Modals/CreateWorkspaceModal';
// import { IconPickerModal } from './components/Modals/IconPickerModal';
// import { CoverGalleryModal } from './components/Modals/CoverGalleryModal';
// import { PageOptionsModal } from './components/Modals/PageOptionsModal';

// Constants
const API_ENDPOINTS = { MARKET: "/api/market", AI: "/api/generar-pagina", UPLOAD: "/api/upload" };

export default function App() {
    return (
        <div className="p-10 text-2xl font-bold text-purple-600">
            <h1>IMPORTS CHECK (LIBS + CORE UI)</h1>
            <p>If you see this, Sidebar and LandingPage imports are fine.</p>
        </div>
    );
}