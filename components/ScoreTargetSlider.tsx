
import React from 'react';

interface ScoreTargetSliderProps {
  value: number;
  onChange: (score: number) => void;
}

export const ScoreTargetSlider: React.FC<ScoreTargetSliderProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };
  
  const getGradientColor = () => {
      const percentage = (value - 70) / (100 - 70) * 100;
      return `linear-gradient(to right, #fb7185 0%, #34d399 ${percentage}%, rgb(var(--input)) ${percentage}%)`
  }

  return (
    <div className="flex items-center space-x-2 sm:space-x-3">
      <label htmlFor="score-slider" className="text-sm font-medium text-muted-foreground hidden sm:block">Target Score:</label>
      <div className="flex items-center space-x-2 w-36 sm:w-40">
        <input
            id="score-slider"
            type="range"
            min="70"
            max="100"
            step="1"
            value={value}
            onChange={handleChange}
            className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer range-lg"
            style={{background: getGradientColor()}}
        />
        <span className="text-sm font-semibold text-primary w-8 text-center">{value}</span>
      </div>
    </div>
  );
};