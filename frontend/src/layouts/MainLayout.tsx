import React from 'react';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-avis-primary text-avis-text-primary font-sans flex flex-col">
            <Header />
            <main className="w-full flex-1 animate-in fade-in duration-500">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
