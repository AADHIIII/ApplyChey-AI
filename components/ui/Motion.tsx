
import React from 'react';
import { motion } from 'framer-motion';
import { Card as OriginalCard } from './Card'; // Assuming the original is in ./Card

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export const MotionCard: React.FC<MotionCardProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      transition={{ duration: 0.18, ease: 'easeOut', delay }}
    >
      <OriginalCard className={className}>{children}</OriginalCard>
    </motion.div>
  );
};