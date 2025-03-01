'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { isLoading, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login({
        username: identifier,
        password: password
      });
      
      if (!success) {
        setError('Échec de connexion');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] px-4">
      <div className="max-w-md w-full space-y-6 p-8 bg-[#252525] rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">EndMC</h2>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#252525] text-gray-400">Connexion</span>
            </div>
          </div>

          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-300 mb-1">
              Email ou Nom d'utilisateur
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="block w-full pl-10 px-4 py-3 bg-[#2e2e2e] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent [&:-webkit-autofill]:bg-[#2e2e2e] [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#2e2e2e_inset] [&:-webkit-autofill]:[background-clip:content-box] [&:-webkit-autofill]:border-gray-700 [-webkit-text-fill-color:white] placeholder:text-gray-500/50"
                placeholder="Entrez votre email ou nom d'utilisateur"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 px-4 py-3 bg-[#2e2e2e] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent [&:-webkit-autofill]:bg-[#2e2e2e] [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#2e2e2e_inset] [&:-webkit-autofill]:[background-clip:content-box] [&:-webkit-autofill]:border-gray-700 [-webkit-text-fill-color:white] placeholder:text-gray-500/50"
                placeholder="Entrez votre mot de passe"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-400">Vous n'avez pas de compte ?</span>{' '}
          <Link href="/register" className="font-medium text-orange-500 hover:text-orange-400">
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}