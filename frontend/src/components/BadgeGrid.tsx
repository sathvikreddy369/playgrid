import React from 'react';
import { motion } from 'framer-motion';

export const BadgeGrid = ({ badges }: { badges: any[] }) => {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">Badges & Achievements</h3>
      <div className="flex flex-wrap gap-3">
        {badges.map((b: any, index: number) => (
          <motion.div 
            key={b.id} 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="w-12 h-12 bg-surface border border-border shadow-sm rounded-2xl flex items-center justify-center text-2xl cursor-help transition-transform hover:scale-110 hover:-translate-y-1 hover:shadow-md" 
            title={`${b.badge?.name}\n${b.badge?.description}`}
          >
            {b.badge?.icon || '🏆'}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
