
import React from 'react';

interface PageLengthSelectorProps {
  value: number;
  onChange: (length: number) => void;
}

export const PageLengthSelector: React.FC<PageLengthSelectorProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLength = parseInt(e.target.value, 10);
    if (newLength >= 1 && newLength <= 3) {
      onChange(newLength);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="length-select" className="text-sm font-medium text-muted-foreground hidden sm:block">Pages:</label>
      <input
        id="length-select"
        type="number"
        min="1"
        max="3"
        value={value}
        onChange={handleChange}
        className="bg-card text-foreground border border-input rounded-md py-1.5 px-2 w-16 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
      />
    </div>
  );
};