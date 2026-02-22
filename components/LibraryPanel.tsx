import React from 'react';
import { Project, SavedComponent } from '../types';
import { CodeIcon, SparklesIcon } from './Icons';

interface LibraryPanelProps {
    project: Project | null;
    onUseComponent: (component: SavedComponent) => void;
    onDeleteComponent: (id: string) => void;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ 
    project, onUseComponent, onDeleteComponent 
}) => {
    if (!project) {
        return (
            <div className="library-panel empty">
                <SparklesIcon />
                <p>No Active Project</p>
                <span style={{ fontSize: '0.7rem', marginTop: '8px' }}>Start a project to access the library.</span>
            </div>
        );
    }

    if (!project.savedComponents || project.savedComponents.length === 0) {
        return (
            <div className="library-panel empty">
                <CodeIcon />
                <p>Library Empty</p>
                <span style={{ fontSize: '0.7rem', marginTop: '8px', maxWidth: '180px' }}>
                    Generate UI elements and save them to build your reusable component library.
                </span>
            </div>
        );
    }

    return (
        <div className="library-panel">
            <div className="panel-header">
                Component Library
            </div>
            <div className="component-list">
                {project.savedComponents.map(comp => (
                    <div key={comp.id} className="component-item">
                        <div className="component-preview">
                            <div className="preview-frame">
                                <iframe 
                                    srcDoc={comp.html} 
                                    title={comp.name}
                                    style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none', transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
                                />
                            </div>
                        </div>
                        <div className="component-info">
                            <span className="component-name">{comp.name}</span>
                            <div className="component-actions">
                                <button onClick={() => onUseComponent(comp)} title="Use Component">
                                    <CodeIcon />
                                </button>
                                <button onClick={() => onDeleteComponent(comp.id)} title="Delete" className="delete-btn">
                                    &times;
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
