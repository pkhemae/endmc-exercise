import SuggestionCard from './SuggestionCard';
import { motion } from 'framer-motion';
import { SuggestionsListProps } from '@/types';

export default function SuggestionsList({ 
  suggestions,
  onLike, 
  onDislike 
}: SuggestionsListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <>
      <motion.div 
        className="flex flex-col space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {suggestions.map((suggestion) => (
          <motion.div key={suggestion.id} variants={itemVariants}>
            <SuggestionCard
              suggestion={suggestion}
              onLike={onLike}
              onDislike={onDislike}
            />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}