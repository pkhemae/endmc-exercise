'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { getCurrentUser } = useAuth();

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      <Navbar />

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