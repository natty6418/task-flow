"use client";
import React from 'react';
import Sidebar from '@/components/SideBar';
import Header from '@/components/Header';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <Header />

            {/* Content Area with Sidebar and Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
