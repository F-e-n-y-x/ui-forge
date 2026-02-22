import React from 'react';
import { GridIcon } from './Icons';

interface ToolbarProps {
    activeTool: 'select' | 'hand' | 'frame' | 'text';
    setActiveTool: (tool: 'select' | 'hand' | 'frame' | 'text') => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    scale: number;
    setScale: (scale: number) => void;
    projectName: string;
    disabled?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
    activeTool, setActiveTool, onUndo, onRedo, canUndo, canRedo, disabled
}) => {
    return (
        <div className={`floating-toolbar ${disabled ? 'disabled' : ''}`}>
            <button 
                className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
                onClick={() => !disabled && setActiveTool('select')}
                title="Select (V)"
                disabled={disabled}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>
            </button>
            <button 
                className={`tool-btn ${activeTool === 'hand' ? 'active' : ''}`}
                onClick={() => !disabled && setActiveTool('hand')}
                title="Hand (H)"
                disabled={disabled}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
            </button>
            <div className="divider-vertical" />
            <button 
                className={`tool-btn ${activeTool === 'frame' ? 'active' : ''}`}
                onClick={() => !disabled && setActiveTool('frame')}
                title="Frame (F)"
                disabled={disabled}
            >
                <GridIcon />
            </button>
            <button 
                className={`tool-btn ${activeTool === 'text' ? 'active' : ''}`}
                onClick={() => !disabled && setActiveTool('text')}
                title="Text (T)"
                disabled={disabled}
            >
                <span style={{ fontFamily: 'serif', fontWeight: 'bold', fontSize: '1.2rem' }}>T</span>
            </button>
            
            <div className="divider-vertical" />
            
            <button 
                className="tool-btn" 
                onClick={onUndo} 
                disabled={!canUndo || disabled}
                style={{ opacity: (canUndo && !disabled) ? 1 : 0.5 }}
                title="Undo (Ctrl+Z)"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </button>
            <button 
                className="tool-btn" 
                onClick={onRedo} 
                disabled={!canRedo || disabled}
                style={{ opacity: (canRedo && !disabled) ? 1 : 0.5 }}
                title="Redo (Ctrl+Y)"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
            </button>
        </div>
    );
};
