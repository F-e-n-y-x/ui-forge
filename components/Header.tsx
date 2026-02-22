import React from 'react';
import { SparklesIcon, ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface HeaderProps {
    projectName: string;
    scale: number;
    setScale: (scale: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    viewportMode: 'desktop' | 'tablet' | 'mobile';
    setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
    isPreviewMode: boolean;
    setIsPreviewMode: (is: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    projectName, scale, setScale, viewportMode, setViewportMode, isPreviewMode, setIsPreviewMode
}) => {
    return (
        <header className="app-header">
            <div className="header-left">
                <div className="brand-logo-small">
                    <SparklesIcon />
                </div>
                <div className="divider" />
                <div className="project-name">{projectName || 'Untitled'}</div>
            </div>

            <div className="header-center">
                {!isPreviewMode && (
                    <div className="viewport-controls" style={{ display: 'flex', background: 'var(--bg-element)', borderRadius: '6px', padding: '2px' }}>
                        <button 
                            onClick={() => setViewportMode('desktop')}
                            style={{ 
                                background: viewportMode === 'desktop' ? 'var(--bg-panel)' : 'transparent',
                                color: viewportMode === 'desktop' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem'
                            }}
                        >
                            Desktop
                        </button>
                        <button 
                            onClick={() => setViewportMode('tablet')}
                            style={{ 
                                background: viewportMode === 'tablet' ? 'var(--bg-panel)' : 'transparent',
                                color: viewportMode === 'tablet' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem'
                            }}
                        >
                            Tablet
                        </button>
                        <button 
                            onClick={() => setViewportMode('mobile')}
                            style={{ 
                                background: viewportMode === 'mobile' ? 'var(--bg-panel)' : 'transparent',
                                color: viewportMode === 'mobile' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem'
                            }}
                        >
                            Mobile
                        </button>
                    </div>
                )}
            </div>

            <div className="header-right">
                <button 
                    className="btn-secondary-small" 
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    style={{ 
                        background: isPreviewMode ? 'var(--accent-primary)' : 'transparent', 
                        color: isPreviewMode ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {isPreviewMode ? 'Exit Preview' : 'Preview'}
                </button>
                <div className="divider" />
                <div className="zoom-controls">
                    <button onClick={() => setScale(Math.max(0.1, scale - 0.1))}>-</button>
                    <span>{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(Math.min(5, scale + 0.1))}>+</button>
                </div>
                <div className="divider" />
                <button className="icon-btn" onClick={onUndo} disabled={!canUndo} title="Undo">
                    <ArrowLeftIcon />
                </button>
                <button className="icon-btn" onClick={onRedo} disabled={!canRedo} title="Redo">
                    <ArrowRightIcon />
                </button>
                <button className="btn-primary-small">
                    Share
                </button>
            </div>
        </header>
    );
};
