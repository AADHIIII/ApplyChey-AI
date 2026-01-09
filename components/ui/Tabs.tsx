
import React from 'react';

export interface TabItem {
    label: string;
    value: string;
}

interface TabsProps {
    items: TabItem[];
    value: string;
    onChange: (value: string) => void;
    label: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, value, onChange, label }) => (
    <div role="tablist" aria-label={label} className="inline-flex items-center justify-center p-1 bg-secondary rounded-lg">
        {items.map((item) => (
            <button
                key={item.value}
                id={`tab-${item.value}`}
                role="tab"
                aria-selected={value === item.value}
                aria-controls={`tabpanel-${item.value}`}
                onClick={() => onChange(item.value)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-secondary ${
                    value === item.value
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'text-muted-foreground hover:bg-background/70'
                }`}
            >
                {item.label}
            </button>
        ))}
    </div>
);