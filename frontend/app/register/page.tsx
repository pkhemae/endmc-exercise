'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { isLoading, register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate the form data
      const validatedData = registerSchema.parse(formData);
      
      await register({
        username: validatedData.username,
        email: validatedData.email,
        full_name: validatedData.full_name,
        password: validatedData.password,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription';
      setError(errorMessage);
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
              <span className="px-2 bg-[#252525] text-gray-400">Créer un compte</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Nom d&apos;utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 px-4 py-3 bg-[#2e2e2e] border border-gray-700 rounded-md text-white placeholder:text-gray-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent [&:-webkit-autofill]:bg-[#2e2e2e] [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#2e2e2e_inset] [&:-webkit-autofill]:[background-clip:content-box] [&:-webkit-autofill]:border-gray-700 [-webkit-text-fill-color:white]"
                  placeholder="Nom d&apos;utilisateur"
                />
              </div>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-1">
                Nom complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="block w-full pl-10 px-4 py-3 bg-[#2e2e2e] border border-gray-700 rounded-md text-white placeholder:text-gray-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent [&:-webkit-autofill]:bg-[#2e2e2e] [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#2e2e2e_inset] [&:-webkit-autofill]:[background-clip:content-box] [&:-webkit-autofill]:border-gray-700 [-webkit-text-fill-color:white]"
                  placeholder="Votre nom complet"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Adresse e-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 px-4 py-3 bg-[#2e2e2e] border border-gray-700 rounded-md text-white placeholder:text-gray-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent [&:-webkit-autofill]:bg-[#2e2e2e] [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#2e2e2e_inset] [&:-webkit-autofill]:[background-clip:content-box] [&:-webkit-autofill]:border-gray-700 [-webkit-text-fill-color:white]"
                placeholder="votre@email.com"
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
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 px-4 py-3 bg-[#2e2e2e] border border-gray-700 rounded-md text-white placeholder:text-gray-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent [&:-webkit-autofill]:bg-[#2e2e2e] [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#2e2e2e_inset] [&:-webkit-autofill]:[background-clip:content-box] [&:-webkit-autofill]:border-gray-700 [-webkit-text-fill-color:white]"
                placeholder="Créer un mot de passe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full pl-10 px-4 py-3 bg-[#2e2e2e] border border-gray-700 rounded-md text-white placeholder:text-gray-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent [&:-webkit-autofill]:bg-[#2e2e2e] [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#2e2e2e_inset] [&:-webkit-autofill]:[background-clip:content-box] [&:-webkit-autofill]:border-gray-700 [-webkit-text-fill-color:white]"
                placeholder="Confirmer votre mot de passe"
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
                  Inscription...
                </span>
              ) : (
                "S'inscrire"
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-400">Vous avez déjà un compte ?</span>{' '}
          <Link href="/login" className="font-medium text-orange-500 hover:text-orange-400">
            S&apos;identifier
          </Link>
        </div>
        
        <div className="text-center text-sm mt-4">
          <Link href="/" className="font-medium text-gray-400 hover:text-gray-300">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}