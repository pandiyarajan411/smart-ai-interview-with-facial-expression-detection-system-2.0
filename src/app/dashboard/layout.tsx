'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store';

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/interview', icon: '🎤', label: 'Interview' },
  { href: '/history', icon: '📋', label: 'History' },
  { href: '/profile', icon: '👤', label: 'Profile' },
];

const ADMIN_NAV = [
  { href: '/admin', icon: '⚙️', label: 'Admin' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) router.push('/auth');
  }, []);

  if (!isAuthenticated()) return null;

  const allNav = isAdmin() ? [...NAV, ...ADMIN_NAV] : NAV;

  return (
    <div className="min-h-screen bg-[#030712] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed h-full bg-[#050b18] border-r border-white/5 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-lg">
              🧠
            </div>
            <div>
              <div className="text-sm font-display font-bold gradient-text">SmartInterview</div>
              <div className="text-xs text-gray-600">AI Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {allNav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
                {active && (
                  <motion.div layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
            <button onClick={() => { logout(); router.push('/'); }}
              className="text-gray-600 hover:text-red-400 transition-all text-sm" title="Logout">
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050b18]/95 backdrop-blur border-t border-white/5 flex">
        {allNav.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-all ${
                active ? 'text-violet-400' : 'text-gray-600'
              }`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Main */}
      <main className="lg:ml-64 flex-1 min-h-screen pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
