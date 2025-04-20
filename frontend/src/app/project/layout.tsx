"use client";
import React from 'react';
import Sidebar from '@/components/SideBar';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main style={{ flex: 1, alignItems: 'start' }}>
                    {children}
                </main>
            </div>
    );
}
