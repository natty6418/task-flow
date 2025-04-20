"use client";
import React from 'react';
import Sidebar from '@/components/SideBar';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="layout">
            <div style={{ display: 'flex', height: '100%' }}>
                <Sidebar />
                <main style={{ flex: 1, alignItems: 'start' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
