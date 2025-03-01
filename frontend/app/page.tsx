'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

export default function Home() {
  const { getCurrentUser } = useAuth();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      <Navbar />
      
      <section className="py-20 bg-[#1e1e1e]">
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <div className="text-center">
            <motion.h1 
              className="text-5xl font-bold text-white sm:text-6xl md:text-7xl tracking-tight"
              variants={item}
            >
              Apportez votre pierre à l'édifice.
            </motion.h1>
            <motion.div 
              className="mt-8 space-y-4"
              variants={item}
            >
              <motion.p 
                className="text-xl text-gray-300 font-medium"
                variants={item}
              >
                Poster et réagir aux suggestions permet de:
              </motion.p>
              <motion.ul 
                className="space-y-3"
                variants={container}
              >
                {['Améliorer les services proposés', 'Rendre le discord plus attrayant', 'Faire caca au lit'].map((text, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center justify-center text-gray-300"
                    variants={item}
                  >
                    <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {text}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
            <motion.div 
              className="mt-8"
              variants={item}
            >
              <motion.a 
                href="/dashboard"
                className="inline-block px-8 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Effectuer une suggestion
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}