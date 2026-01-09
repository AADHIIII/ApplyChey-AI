
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Command {
  name: string;
  action: () => void;
  disabled?: boolean;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, actions }) => {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredActions = actions.filter(
    (action) =>
      action.name.toLowerCase().includes(search.toLowerCase()) && !action.disabled
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setActiveIndex(0);
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter' && filteredActions[activeIndex]) {
      e.preventDefault();
      filteredActions[activeIndex].action();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg bg-card border border-border shadow-2xl rounded-lg overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            <div className="p-3 border-b border-border">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                value={search}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 bg-transparent border-none rounded-md focus:outline-none focus:ring-0 text-card-foreground placeholder:text-muted-foreground"
              />
            </div>
            <ul className="p-2 max-h-[300px] overflow-y-auto">
              {filteredActions.length > 0 ? (
                filteredActions.map((action, index) => (
                  <li
                    key={action.name}
                    onClick={() => {
                      action.action();
                      onClose();
                    }}
                    className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${index === activeIndex ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                      }`}
                  >
                    {action.name}
                  </li>
                ))
              ) : (
                <p className="p-4 text-center text-sm text-muted-foreground">No results found.</p>
              )}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};