import { X, Check } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface DeleteSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  suggestionTitle: string;
}

export default function DeleteSuggestionModal({
  isOpen,
  onClose,
  onConfirm,
  suggestionTitle
}: DeleteSuggestionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        modalRef.current && 
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-[#1e1e1e] rounded-2xl overflow-hidden w-full max-w-md mx-4 border border-gray-700"
      >
        <div className="p-8">
          <p className="text-white text-center text-lg">
            Êtes-vous sûr de vouloir supprimer la suggestion <span className="font-medium">"{suggestionTitle}"</span> ?
          </p>
        </div>
        
        <div className="flex">
          <button
            onClick={onClose}
            className="flex-1 p-4 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <X className="h-5 w-5 text-red-500" />
            <span className="text-red-500 font-medium">Annuler</span>
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 p-4 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="h-5 w-5 text-lime-400" />
            <span className="text-green-400 font-medium">Confirmer</span>
          </button>
        </div>
      </div>
    </div>
  );
}