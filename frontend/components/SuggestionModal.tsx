import { useState, useEffect } from 'react';
import { useSuggestions } from '@/hooks/useSuggestions';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (success: boolean) => void;
}

export default function SuggestionModal({ isOpen, onClose, onSuccess }: SuggestionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ title: '', description: '' });
  const { createSuggestion } = useSuggestions();

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setErrors({ title: '', description: '' });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const validateForm = () => {
    const newErrors = { title: '', description: '' };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Le titre est requis';
      isValid = false;
    } else if (title.length > 100) {
      newErrors.title = 'Le titre ne doit pas dépasser 100 caractères';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'La description est requise';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await createSuggestion({ title, description });
      if (result) {
        onClose();
        if (onSuccess) onSuccess(true);
      }
    } catch (error) {
      console.error('Failed to create suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-[#252525] rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Nouvelle suggestion</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="title">
              Titre
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full bg-[#1e1e1e] text-white border ${errors.title ? 'border-red-500' : 'border-gray-700'} rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
              placeholder="Titre de votre suggestion"
              disabled={isSubmitting}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full bg-[#1e1e1e] text-white border ${errors.description ? 'border-red-500' : 'border-gray-700'} rounded-lg p-2 h-32 focus:outline-none focus:ring-2 focus:ring-orange-500`}
              placeholder="Décrivez votre suggestion"
              disabled={isSubmitting}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi...' : 'Soumettre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}