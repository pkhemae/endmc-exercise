'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isLoading, logout, getCurrentUser } = useAuth();

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    }
    
    if (isProfileOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isProfileOpen]);

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      <nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="text-white font-bold text-xl">
                EndMC
              </Link>
            </div>

            <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 focus:outline-none rounded-xl p-2 transition-all duration-200"
                >
                  <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                    <span className="text-sm font-medium">
                      {user ? `${user.full_name.split(' ').map(n => n[0]).join('')}` : '...'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-white">
                    {user ? user.full_name : 'Loading...'}
                  </span>
                  <svg 
                    className={`hidden sm:block h-4 w-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

              {isProfileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 py-2 bg-[#252525] rounded-xl shadow-xl border border-gray-700 z-10 transform origin-top-right transition-all duration-200 ease-out"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user?.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors rounded-lg mx-2"
                      role="menuitem"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Paramètres
                    </Link>
                  </div>
                  
                  <div className="py-1 border-t border-gray-700">
                    <div className="px-2">
                      <button
                        onClick={logout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors rounded-lg group"
                        role="menuitem"
                      >
                        <LogOut className="mr-3 h-4 w-4 group-hover:text-white transition-colors" />
                        <span className="w-full text-left">Déconnexion</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-white">Tableau de bord</h1>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-[#252525] rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">Bienvenue sur EndMC</h2>
            <p className="text-gray-300">kayako beme</p>
          </div>
        </div>
      </main>
    </div>
  );
}