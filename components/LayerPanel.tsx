import React from 'react';
import { Project, Screen } from '../types';
import { GridIcon } from './Icons';

interface LayerPanelProps {
    project: Project | null;
    selectedScreenId: string | null;
    onSelectScreen: (id: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ 
    project, selectedScreenId, onSelectScreen 
}) => {
    if (!project) {
        return (
            <div className="layer-panel empty">
                <GridIcon />
                <p>No Active Project</p>
                <span style={{ fontSize: '0.7rem', marginTop: '8px' }}>Create a new project to start designing.</span>
            </div>
        );
    }

    return (
        <div className="layer-panel">
            <div className="panel-header">
                Layers
            </div>
            <div className="layer-list">
                <div className="layer-section-title">Pages</div>
                {project.screens.map(screen => (
                    <div 
                        key={screen.id} 
                        className={`layer-item ${selectedScreenId === screen.id ? 'active' : ''}`}
                        onClick={() => onSelectScreen(screen.id)}
                    >
                        <GridIcon />
                        <span>{screen.pageName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
