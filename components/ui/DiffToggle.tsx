
import React from 'react';
import { type DiffViewMode } from '../../types';
import { Tabs, type TabItem } from './Tabs';

interface DiffToggleProps {
  value: DiffViewMode;
  onChange: (value: DiffViewMode) => void;
}

const diffItems: TabItem[] = [
    { label: 'Original', value: 'original' },
    { label: 'Tailored', value: 'tailored' },
    { label: 'Diff', value: 'diff' },
];

export const DiffToggle: React.FC<DiffToggleProps> = ({ value, onChange }) => {
  return (
    <Tabs
        label="Resume View"
        items={diffItems}
        value={value}
        onChange={(val) => onChange(val as DiffViewMode)}
    />
  );
};