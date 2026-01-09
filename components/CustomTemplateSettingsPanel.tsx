
import React from 'react';
import { CustomTemplateSettings } from '../types';

interface CustomTemplateSettingsPanelProps {
    settings: CustomTemplateSettings;
    onChange: (settings: CustomTemplateSettings) => void;
    className?: string;
}

const colors = ['#4F46E5', '#0D9488', '#DB2777', '#D97706', '#1E40AF', '#374151'];
const fontFamilies = [ { value: 'sans', label: 'Sans-Serif' }, { value: 'charter', label: 'Serif' }, { value: 'mono', label: 'Monospace' } ] as const;
const fontSizes = [ { value: 'sm', label: 'Small' }, { value: 'base', label: 'Medium' }, { value: 'lg', label: 'Large' } ] as const;

export const CustomTemplateSettingsPanel: React.FC<CustomTemplateSettingsPanelProps> = ({ settings, onChange, className = '' }) => {
    
    const handleSettingChange = <K extends keyof CustomTemplateSettings>(
        key: K,
        value: CustomTemplateSettings[K]
    ) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className={`p-3 bg-secondary/50 rounded-lg flex flex-wrap items-center gap-3 border border-border ${className}`}>
            <div>
                 <label className="text-xs font-medium text-muted-foreground block mb-1.5">Color</label>
                 <div className="flex items-center gap-1.5 flex-wrap">
                    {colors.map(color => (
                        <button key={color} title={color} onClick={() => handleSettingChange('primaryColor', color)} className={`w-5 h-5 rounded-full transition-transform duration-150 ease-in-out hover:scale-110 ${settings.primaryColor === color ? 'ring-2 ring-offset-2 ring-offset-secondary ring-primary' : ''}`} style={{ backgroundColor: color }} aria-label={`Select color ${color}`} />
                    ))}
                 </div>
            </div>
             <div className="border-l border-border h-8 mx-1 hidden sm:block"></div>
             <div className="flex gap-3 flex-wrap">
                 <div>
                     <label htmlFor="font-family" className="text-xs font-medium text-muted-foreground block mb-1">Font</label>
                     <select id="font-family" value={settings.fontFamily} onChange={e => handleSettingChange('fontFamily', e.target.value as CustomTemplateSettings['fontFamily'])} className="bg-card text-foreground border border-input rounded-md py-1 pl-2 pr-7 text-xs focus:outline-none focus:ring-1 focus:ring-ring w-full">
                         {fontFamilies.map(font => <option key={font.value} value={font.value}>{font.label}</option>)}
                     </select>
                </div>
                <div>
                     <label htmlFor="font-size" className="text-xs font-medium text-muted-foreground block mb-1">Size</label>
                     <select id="font-size" value={settings.fontSize} onChange={e => handleSettingChange('fontSize', e.target.value as CustomTemplateSettings['fontSize'])} className="bg-card text-foreground border border-input rounded-md py-1 pl-2 pr-7 text-xs focus:outline-none focus:ring-1 focus:ring-ring w-full">
                         {fontSizes.map(size => <option key={size.value} value={size.value}>{size.label}</option>)}
                     </select>
                </div>
            </div>
        </div>
    );
};
