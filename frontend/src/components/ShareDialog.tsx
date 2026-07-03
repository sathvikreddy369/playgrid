import React, { useState } from 'react';
import { Copy, Check, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, title, url }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface rounded-2xl p-6 max-w-sm w-full border border-border shadow-xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted hover:text-foreground hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-foreground">
              <Share2 className="w-5 h-5 text-blue-500" /> Share
            </h2>
            <p className="text-sm text-muted mb-4 font-bold">{title}</p>
            
            <div className="flex items-center gap-2 mb-6">
              <input 
                type="text" 
                value={url} 
                readOnly 
                className="flex-1 p-3 bg-zinc-50 border border-border rounded-xl text-sm text-foreground focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className="p-3 bg-zinc-100 text-foreground hover:bg-zinc-200 transition-colors rounded-xl font-bold flex-shrink-0"
                title="Copy Link"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {navigator.share && (
              <button 
                onClick={handleNativeShare}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Share via...
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
