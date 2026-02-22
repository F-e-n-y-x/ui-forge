import React from 'react';
import { Project, DesignSystem } from '../types';
import { PaletteIcon } from './Icons';

interface PropertiesPanelProps {
    project: Project | null;
    selectedScreenId: string | null;
    onUpdateDesignSystem: (ds: DesignSystem) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
    project, selectedScreenId, onUpdateDesignSystem 
}) => {
    if (!project) {
        return (
            <div className="properties-panel empty">
                <p>Select a project to edit properties</p>
            </div>
        );
    }

    const ds = project.designSystem || {
        colors: { primary: '#000000', secondary: '#ffffff', background: '#ffffff', text: '#000000', accent: '#0000ff' },
        typography: { headingFont: 'Inter', bodyFont: 'Inter', scale: 1.2 },
        spacing: { base: 4, scale: 1.5 },
        borderRadius: 4
    };

    const handleColorChange = (key: keyof typeof ds.colors, value: string) => {
        onUpdateDesignSystem({
            ...ds,
            colors: { ...ds.colors, [key]: value }
        });
    };

    return (
        <div className="properties-panel">
            <div className="panel-header">
                <PaletteIcon /> Design System
            </div>
            
            <div className="panel-section">
                <h3>Colors</h3>
                <div className="color-grid">
                    {Object.entries(ds.colors).map(([key, value]) => (
                        <div key={key} className="color-item">
                            <input 
                                type="color" 
                                value={value} 
                                onChange={(e) => handleColorChange(key as any, e.target.value)}
                            />
                            <label>{key}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="panel-section">
                <h3>Typography</h3>
                <div className="form-group">
                    <label>Heading Font</label>
                    <select 
                        value={ds.typography.headingFont}
                        onChange={(e) => onUpdateDesignSystem({ ...ds, typography: { ...ds.typography, headingFont: e.target.value } })}
                    >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Space Grotesk">Space Grotesk</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Body Font</label>
                    <select 
                        value={ds.typography.bodyFont}
                        onChange={(e) => onUpdateDesignSystem({ ...ds, typography: { ...ds.typography, bodyFont: e.target.value } })}
                    >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                    </select>
                </div>
            </div>

            <div className="panel-section">
                <h3>Spacing & Radius</h3>
                <div className="form-group">
                    <label>Base Spacing ({ds.spacing.base}px)</label>
                    <input 
                        type="range" min="2" max="16" step="2"
                        value={ds.spacing.base}
                        onChange={(e) => onUpdateDesignSystem({ ...ds, spacing: { ...ds.spacing, base: parseInt(e.target.value) } })}
                    />
                </div>
                <div className="form-group">
                    <label>Border Radius ({ds.borderRadius}px)</label>
                    <input 
                        type="range" min="0" max="24" step="2"
                        value={ds.borderRadius}
                        onChange={(e) => onUpdateDesignSystem({ ...ds, borderRadius: parseInt(e.target.value) })}
                    />
                </div>
            </div>
        </div>
    );
};
