'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, getCurrentUser } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);
  
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
    <nav className="bg-[#1e1e1e] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                EndMC
              </Link>
            </div>
            
            <div className="hidden md:block ml-6">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/suggestions" 
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200
                    ${pathname.startsWith('/suggestions') ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Suggestions
                  {pathname.startsWith('/suggestions') && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform transition-transform duration-300"></span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/10 active:scale-75 focus:outline-none rounded-xl p-2 transition-all duration-300"
                >
                  <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                    <span className="text-sm font-medium">
                      {user.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="hidden sm:block text-white">
                    {user.full_name}
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
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors rounded-lg mx-2"
                        role="menuitem"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Tableau de bord
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
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-md"
                >
                  Connexion
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div 
        className={`md:hidden fixed inset-0 z-20 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          <div className="absolute top-0 left-0 w-64 h-full bg-[#252525] shadow-lg overflow-y-auto">
            <div className="px-4 py-4 border-b border-gray-700 flex items-center justify-between">
              <span className="text-white font-medium">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-2 py-3 space-y-1">
              <Link
                href="/suggestions"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname.startsWith('/suggestions')
                    ? 'text-white bg-orange-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Suggestions
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-orange-500 hover:bg-orange-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}