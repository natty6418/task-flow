"use client";
import React from 'react';
import Sidebar from '@/components/SideBar';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="layout">
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <main style={{ flex: 1 }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
