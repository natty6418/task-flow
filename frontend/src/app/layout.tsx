import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../contexts/Providers";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  fallback: ["Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskFlow - Streamline Your Workflow",
  description: "TaskFlow helps teams organize, track, and complete projects efficiently. Collaborate seamlessly, meet deadlines, and achieve your goals.",
  icons: {
    icon: [
      { url: '/assets/logo-small.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/logo-small.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: '/assets/logo-small.png',
    shortcut: '/assets/logo-small.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
        {children}
        </Providers>
      </body>
    </html>
  );
}
