import { lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ProtectedLayout } from './ProtectedLayout';
import PageTransition from '../layouts/PageTransition';

// Lazy load components
const GrimoireDashboard = lazy(() => import('../features/fantasy/GrimoireDashboard'));
const LoginScreen = lazy(() => import('../features/auth/LoginScreen'));
const HeroHall = lazy(() => import('../features/auth/HeroHall'));
const AddTransaction = lazy(() => import('../features/dashboard/AddTransaction'));
const TransactionHistory = lazy(() => import('../features/fantasy/TransactionHistory'));
const MarketplaceScreen = lazy(() => import('../features/marketplace/MarketplaceScreen'));
const DebtTracker = lazy(() => import('../features/fantasy/DebtTracker'));
const FinancialScore = lazy(() => import('../features/fantasy/FinancialScore'));
const SharedAccounts = lazy(() => import('../features/fantasy/SharedAccounts'));
const MercenaryContracts = lazy(() => import('../features/fantasy/MercenaryContracts'));
const TreasureChests = lazy(() => import('../features/fantasy/TreasureChests'));
const AdventurerLicense = lazy(() => import('../features/fantasy/AdventurerLicense'));

export default function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={
                    <PageTransition>
                        <LoginScreen />
                    </PageTransition>
                } />
                <Route path="/hero-hall" element={
                    <PageTransition>
                        <HeroHall />
                    </PageTransition>
                } />

                <Route element={<ProtectedLayout />}>
                    <Route path="/" element={
                        <PageTransition>
                            <GrimoireDashboard />
                        </PageTransition>
                    } />
                    <Route path="/app" element={
                        <PageTransition>
                            <GrimoireDashboard />
                        </PageTransition>
                    } />
                    <Route path="/add-transaction" element={
                        <PageTransition>
                            <AddTransaction />
                        </PageTransition>
                    } />
                    <Route path="/transactions" element={
                        <PageTransition>
                            <TransactionHistory />
                        </PageTransition>
                    } />
                    <Route path="/marketplace" element={
                        <PageTransition>
                            <MarketplaceScreen />
                        </PageTransition>
                    } />
                    <Route path="/debt-tracker" element={
                        <PageTransition>
                            <DebtTracker />
                        </PageTransition>
                    } />
                    <Route path="/financial-score" element={
                        <PageTransition>
                            <FinancialScore />
                        </PageTransition>
                    } />
                    <Route path="/shared-accounts" element={
                        <PageTransition>
                            <SharedAccounts />
                        </PageTransition>
                    } />
                    <Route path="/mercenary-contracts" element={
                        <PageTransition>
                            <MercenaryContracts />
                        </PageTransition>
                    } />
                    <Route path="/treasure-chests" element={
                        <PageTransition>
                            <TreasureChests />
                        </PageTransition>
                    } />
                    <Route path="/adventurer-license" element={
                        <PageTransition>
                            <AdventurerLicense />
                        </PageTransition>
                    } />
                    <Route path="/profile" element={
                        <PageTransition>
                            <AdventurerLicense />
                        </PageTransition>
                    } />
                </Route>
            </Routes>
        </AnimatePresence>
    );
}
