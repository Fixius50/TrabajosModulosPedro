import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, MessageSquare, MoreHorizontal, Check } from 'lucide-react';
import { clsx } from 'clsx';

// Imports from our modules
import { supabase, AuthService } from './lib/supabase';
import { BackupService } from './lib/backup';
import { utils, ICONS_LIST, COVER_COLORS, COVER_IMAGES } from './lib/utils';
import { useAppStore } from './store/useAppStore';

// Components
import { LandingPage } from './components/Views/LandingPage';
import Sidebar from './components/Sidebar/Sidebar';
import { Modal } from './components/UI';

// Views
import { HomeView } from './components/Views/HomeView';
import { InboxView } from './components/Views/InboxView';
import { TrashView } from './components/Views/TrashView';
import { SettingsView } from './components/Views/SettingsView';
import { PageView } from './components/Views/PageView';

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
        <div className="p-10 text-2xl font-bold text-orange-600">
            <h1>IMPORTS CHECK (VIEWS)</h1>
            <p>If you see this, all Views (Home, Inbox, Trash, Settings, Page) are fine.</p>
        </div>
    );
}