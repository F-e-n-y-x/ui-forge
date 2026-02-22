/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { toSvg } from 'html-to-image';

import { Screen, Project, DesignSystem, UserCursor, SavedComponent } from './types';
import { generateId } from './utils';

import GridBackground from './components/GridBackground';
import SideDrawer from './components/SideDrawer';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { LayerPanel } from './components/LayerPanel';
import { LibraryPanel } from './components/LibraryPanel';
import { SparklesIcon, ArrowRightIcon, CodeIcon, DownloadIcon } from './components/Icons';

const STYLES = [
    { id: 'random', label: 'AI Random' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'brutalist', label: 'Brutalist' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'cyber', label: 'Cyberpunk' },
    { id: 'organic', label: 'Organic' },
    { id: 'playful', label: 'Playful' },
    { id: 'industrial', label: 'Industrial' },
    { id: 'neo-brutalist', label: 'Neo-Brutalist' },
    { id: 'glassmorphism', label: 'Glassmorphism' },
    { id: 'skeuomorphism', label: 'Skeuomorphism' }
];

function App() {
  // === State ===
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState<number>(-1);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  
  // Inputs
  const [brandName, setBrandName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('random');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Canvas State
  const [scale, setScale] = useState(0.6); 
  const [pan, setPan] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [textInput, setTextInput] = useState<{ x: number, y: number, value: string } | null>(null);

  // Tools
  const [activeTool, setActiveTool] = useState<'select' | 'hand' | 'frame' | 'text'>('select');

  // Default Components
  useEffect(() => {
      if (projects.length === 0) return;
      // Check if current project has components, if not add defaults
      if (currentProjectIndex !== -1) {
          const project = projects[currentProjectIndex];
          if (!project.savedComponents || project.savedComponents.length === 0) {
             const defaults: SavedComponent[] = [
                 { id: 'def_1', name: 'Hero Section', category: 'Section', timestamp: Date.now(), html: '<section style="padding: 80px 20px; text-align: center; background: var(--color-background); color: var(--color-text);"><h1 style="font-family: var(--font-heading); font-size: 3rem; margin-bottom: 20px;">Hero Title</h1><p style="font-family: var(--font-body); font-size: 1.2rem; opacity: 0.8; max-width: 600px; margin: 0 auto 30px;">Compelling subtitle goes here.</p><button style="background: var(--color-accent); color: #fff; padding: 12px 24px; border: none; border-radius: var(--radius-base); font-size: 1rem; cursor: pointer;">Get Started</button></section>' },
                 { id: 'def_2', name: 'Feature Card', category: 'Card', timestamp: Date.now(), html: '<div style="padding: 30px; background: var(--color-secondary); border-radius: var(--radius-base); box-shadow: var(--shadow-medium);"><h3 style="font-family: var(--font-heading); margin-top: 0;">Feature</h3><p style="font-family: var(--font-body); opacity: 0.8;">Description of the feature goes here.</p></div>' },
                 { id: 'def_3', name: 'Navbar', category: 'Navigation', timestamp: Date.now(), html: '<nav style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: var(--color-background); border-bottom: 1px solid rgba(0,0,0,0.1);"><div style="font-weight: bold; font-size: 1.5rem; font-family: var(--font-heading);">Brand</div><div style="display: flex; gap: 20px;"><a href="#" style="text-decoration: none; color: var(--color-text);">Home</a><a href="#" style="text-decoration: none; color: var(--color-text);">About</a><button style="background: var(--color-primary); color: var(--color-background); padding: 8px 16px; border: none; border-radius: var(--radius-base);">Login</button></div></nav>' }
             ];
             const updated = { ...project, savedComponents: defaults };
             const newProjects = [...projects];
             newProjects[currentProjectIndex] = updated;
             setProjects(newProjects);
          }
      }
  }, [currentProjectIndex, projects.length]); // Run when project changes or init

  // History
  const [history, setHistory] = useState<Project[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Collaboration
  const [cursors, setCursors] = useState<UserCursor[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const myIdRef = useRef<string | null>(null);

  const [drawerState, setDrawerState] = useState<{
      isOpen: boolean;
      mode: 'code' | 'refine' | null;
      title: string;
      data: any; 
  }>({ isOpen: false, mode: null, title: '', data: null });

  const [refineInput, setRefineInput] = useState('');

  // === Actions ===
  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 5000);
  };

  // === History Logic ===
  const addToHistory = (newProjects: Project[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newProjects);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
      if (historyIndex > 0) {
          setHistoryIndex(historyIndex - 1);
          setProjects(history[historyIndex - 1]);
      }
  };

  const handleRedo = () => {
      if (historyIndex < history.length - 1) {
          setHistoryIndex(historyIndex + 1);
          setProjects(history[historyIndex + 1]);
      }
  };

  const broadcastProjectUpdate = (updatedProjects: Project[]) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          // Debounce or throttle could be added here for performance
          wsRef.current.send(JSON.stringify({
              type: 'project_update',
              projects: updatedProjects
          }));
      }
  };

  const updateProjects = (newProjects: Project[], shouldBroadcast = true) => {
      setProjects(newProjects);
      addToHistory(newProjects);
      if (shouldBroadcast) {
          broadcastProjectUpdate(newProjects);
      }
  };

  // === Collaboration Logic ===
  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}`);
    wsRef.current = ws;

    ws.onopen = () => {
        console.log('Connected to collaboration server');
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'init') {
                myIdRef.current = data.id;
            } else if (data.type === 'cursor_move') {
                setCursors(prev => {
                    const filtered = prev.filter(c => c.id !== data.userId);
                    return [...filtered, { 
                        id: data.userId, 
                        x: data.x, 
                        y: data.y, 
                        color: data.userColor, 
                        name: data.userName 
                    }];
                });
            } else if (data.type === 'user_disconnect') {
                setCursors(prev => prev.filter(c => c.id !== data.userId));
            } else if (data.type === 'project_update') {
                // Receive project update from another user
                // Only update if the ID is different (handled by server broadcasting to others)
                // We should probably merge or replace. For now, replace.
                if (data.userId !== myIdRef.current) {
                    setProjects(data.projects);
                    // Don't add to history to avoid loop or just add? 
                    // Let's not add to history for remote updates to keep local undo stack clean? 
                    // Or maybe we should. Let's add for now but careful with loops.
                    // Actually, updateProjects adds to history.
                    // We need to update state without broadcasting back.
                    setProjects(data.projects);
                }
            }
        } catch (e) {
            console.error('WS Error', e);
        }
    };

    return () => {
        ws.close();
    };
  }, []);

  const broadcastCursor = (x: number, y: number) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
              type: 'cursor_move',
              x,
              y
          }));
      }
  };

  // === Canvas Logic ===
  const handleWheel = (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const zoomSensitivity = 0.001;
          const delta = -e.deltaY * zoomSensitivity;
          const newScale = Math.min(Math.max(scale + delta, 0.1), 5);
          setScale(newScale);
      } else {
          setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      if (activeTool === 'hand' || e.button === 1 || e.button === 0) {
          setIsDragging(true);
          setLastMousePos({ x: e.clientX, y: e.clientY });
      }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
      // Check if it was a drag
      const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
      if (dist > 5) return; // It was a drag

      if (activeTool === 'text' && canvasRef.current && currentProjectIndex !== -1) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - pan.x) / scale;
          const y = (e.clientY - rect.top - pan.y) / scale;
          
          setTextInput({ x, y, value: '' });
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      // Broadcast cursor position (relative to canvas)
      if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - pan.x) / scale;
          const y = (e.clientY - rect.top - pan.y) / scale;
          broadcastCursor(x, y);
      }

      if (isDragging) {
          const deltaX = e.clientX - lastMousePos.x;
          const deltaY = e.clientY - lastMousePos.y;
          setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
          setLastMousePos({ x: e.clientX, y: e.clientY });
      }
  };

  const handleMouseUp = () => setIsDragging(false);

  // === Generation Logic ===
  const generateProject = async () => {
    if (!promptInput.trim() || isLoading) return;

    setIsLoading(true);
    const projectId = generateId();
    const baseTime = Date.now();

    // 1. Define Project
    let fullPrompt = `PROJECT: ${promptInput}\n`;
    if (brandName) fullPrompt += `BRAND: ${brandName}\n`;
    if (targetAudience) fullPrompt += `AUDIENCE: ${targetAudience}\n`;
    if (referenceUrl) fullPrompt += `REF URL: ${referenceUrl}\n`;

    const newProject: Project = {
        id: projectId,
        prompt: fullPrompt,
        timestamp: baseTime,
        screens: [],
        designSystem: {
            colors: { primary: '#000000', secondary: '#ffffff', background: '#ffffff', text: '#000000', accent: '#0000ff' },
            typography: { headingFont: 'Inter', bodyFont: 'Inter', scale: 1.2 },
            spacing: { base: 4, scale: 1.5 },
            borderRadius: 4
        }
    };

    const updatedProjects = [...projects, newProject];
    updateProjects(updatedProjects);
    setCurrentProjectIndex(updatedProjects.length - 1);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API_KEY Missing");
        const ai = new GoogleGenAI({ apiKey });

        // 2. Plan Pages
        const planPrompt = `
Analyze this web project request: "${fullPrompt}".
Identify the 3-5 essential pages needed for a complete user flow (e.g., "Landing", "Login", "Dashboard", "Settings").
Return ONLY a JSON array of strings, e.g., ["Home", "About", "Contact"].
        `.trim();

        const planResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { role: 'user', parts: [{ text: planPrompt }] }
        });

        let pageNames = ["Home", "Features", "Contact"]; // Fallback
        try {
            const text = planResponse.text || '[]';
            const jsonMatch = text.match(/\[.*\]/s);
            if (jsonMatch) pageNames = JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.warn("Failed to parse page plan, using defaults");
        }

        // 3. Initialize Placeholders
        const initialScreens: Screen[] = pageNames.map((name, i) => ({
            id: `${projectId}_${i}`,
            pageName: name,
            styleName: selectedStyle,
            html: '',
            status: 'streaming',
            x: i * 1400, // Spaced out for desktop
            y: 0
        }));

        const projectsWithScreens = updatedProjects.map(p => p.id === projectId ? { ...p, screens: initialScreens } : p);
        updateProjects(projectsWithScreens);

        // 4. Generate Pages Sequentially
        let designSystemContext = ""; 

        for (let i = 0; i < initialScreens.length; i++) {
            const screen = initialScreens[i];
            const isFirst = i === 0;
            
            const pagePrompt = `
ROLE: Elite Frontend Architect.
PROJECT: ${fullPrompt}
PAGE: ${screen.pageName}
STYLE: ${selectedStyle}
${isFirst ? "TASK: Establish the Design System (Fonts, Colors, Layout) and generate the page." : `TASK: Follow the established Design System from the Home page.`}
${designSystemContext ? `DESIGN SYSTEM CONTEXT: ${designSystemContext}` : ''}

REQUIREMENTS:
1. Full responsive HTML/CSS/JS. Use media queries for Mobile (max-width: 768px) and Tablet (max-width: 1024px).
2. No external dependencies (use standard Google Fonts).
3. Creative, polished, production-ready.
4. If this is "Home", include Hero, Features, Footer.
5. If "Login", include Form, Social Auth.
6. If "Dashboard", include Sidebar, Charts, Data Grid.
7. IMPORTANT: Embed the Design System as CSS Variables in a <style id="design-system-styles"> tag at the top.
8. Ensure the layout adapts gracefully to smaller screens (stacking columns, adjusting font sizes).

OUTPUT: Raw HTML only.
            `.trim();

            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: [{ parts: [{ text: pagePrompt }], role: "user" }],
            });

            let accumulatedHtml = '';
            for await (const chunk of responseStream) {
                const text = chunk.text;
                if (typeof text === 'string') {
                    accumulatedHtml += text;
                    setProjects(prev => prev.map(p => 
                        p.id === projectId ? {
                            ...p,
                            screens: p.screens.map(s => s.id === screen.id ? { ...s, html: accumulatedHtml } : s)
                        } : p
                    ));
                }
            }
            
            let finalHtml = accumulatedHtml.trim().replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '');
            
            if (isFirst) {
                const styleMatch = finalHtml.match(/<style id="design-system-styles">([\s\S]*?)<\/style>/);
                if (styleMatch) {
                    designSystemContext = "Use these CSS variables: " + styleMatch[1].substring(0, 500) + "..."; 
                }
            }

            setProjects(prev => prev.map(p => 
                p.id === projectId ? {
                    ...p,
                    screens: p.screens.map(s => s.id === screen.id ? { ...s, html: finalHtml, status: 'complete' } : s)
                } : p
            ));
        }

    } catch (e) {
        console.error("Generation failed", e);
        showToast("Generation failed. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRefine = (screen: Screen) => {
      setDrawerState({ isOpen: true, mode: 'refine', title: `REFINE: ${screen.pageName}`, data: screen });
      setRefineInput('');
  };

  const submitRefinement = async () => {
      if (!refineInput.trim() || !drawerState.data) return;
      const screen = drawerState.data as Screen;
      const project = projects.find(p => p.screens.some(s => s.id === screen.id));
      if (!project) return;

      setDrawerState(s => ({ ...s, isOpen: false }));
      setIsLoading(true);

      setProjects(prev => prev.map(p => 
        p.id === project.id ? {
            ...p,
            screens: p.screens.map(s => s.id === screen.id ? { ...s, status: 'streaming', html: '' } : s)
        } : p
      ));

      try {
          const apiKey = process.env.API_KEY;
          if (!apiKey) throw new Error("API_KEY Missing");
          const ai = new GoogleGenAI({ apiKey });

          const prompt = `
Refine this page: "${screen.pageName}"
Project: "${project.prompt}"
Feedback: "${refineInput}"
Current HTML: ${screen.html}
Output: Updated Raw HTML.
          `.trim();

          const responseStream = await ai.models.generateContentStream({
              model: 'gemini-3-flash-preview',
              contents: [{ parts: [{ text: prompt }], role: "user" }],
          });

          let accumulatedHtml = '';
            for await (const chunk of responseStream) {
                const text = chunk.text;
                if (typeof text === 'string') {
                    accumulatedHtml += text;
                    setProjects(prev => prev.map(p => 
                        p.id === project.id ? {
                            ...p,
                            screens: p.screens.map(s => s.id === screen.id ? { ...s, html: accumulatedHtml } : s)
                        } : p
                    ));
                }
            }
            
            let finalHtml = accumulatedHtml.trim().replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '');

            setProjects(prev => prev.map(p => 
                p.id === project.id ? {
                    ...p,
                    screens: p.screens.map(s => s.id === screen.id ? { ...s, html: finalHtml, status: 'complete' } : s)
                } : p
            ));

      } catch (e) {
          console.error("Refine failed", e);
      } finally {
          setIsLoading(false);
      }
  };

  const handleCopyCode = async (html: string) => {
      try {
        await navigator.clipboard.writeText(html);
        showToast("HTML Copied to Clipboard");
      } catch (err) {
          showToast("Failed to copy code");
      }
  };

  const handleCopyToFigma = async (screenId: string) => {
      const node = document.getElementById(`screen-preview-${screenId}`);
      if (!node) return;
      
      try {
          // Find the iframe inside
          const iframe = node.querySelector('iframe');
          if (!iframe || !iframe.contentDocument) return;
          
          // We need to capture the iframe content. 
          // Since html-to-image might not work well across iframe boundaries directly if we pass the iframe node,
          // we can try to capture the body of the iframe document.
          // However, cross-origin restrictions might apply if src is not srcDoc.
          // Here we use srcDoc so it should be same-origin.
          
          const svgDataUrl = await toSvg(iframe.contentDocument.body);
          
          // Copy SVG string to clipboard
          // We need to fetch the data URL to get the blob/text
          const res = await fetch(svgDataUrl);
          const svgText = await res.text();
          
          await navigator.clipboard.writeText(svgText);
          showToast("Copied as SVG (Paste in Figma)");
      } catch (err) {
          console.error(err);
          showToast("Failed to generate Figma SVG");
      }
  };

  const handleDownloadHTML = (html: string, id: string) => {
      try {
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ui-forge-${id}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast("HTML Downloaded");
      } catch (err) {
          showToast("Failed to download");
      }
  };

  const handleUpdateDesignSystem = (newDs: DesignSystem) => {
      if (currentProjectIndex === -1) return;
      
      const cssVariables = `
        :root {
            --color-primary: ${newDs.colors.primary};
            --color-secondary: ${newDs.colors.secondary};
            --color-background: ${newDs.colors.background};
            --color-text: ${newDs.colors.text};
            --color-accent: ${newDs.colors.accent};
            --font-heading: '${newDs.typography.headingFont}', sans-serif;
            --font-body: '${newDs.typography.bodyFont}', sans-serif;
            --spacing-base: ${newDs.spacing.base}px;
            --radius-base: ${newDs.borderRadius}px;
            --shadow-small: ${newDs.shadows?.small || 'none'};
            --shadow-medium: ${newDs.shadows?.medium || 'none'};
            --shadow-large: ${newDs.shadows?.large || 'none'};
            --layout-max-width: ${newDs.layout?.maxWidth || 1200}px;
        }
      `;

      const updatedProjects = [...projects];
      const currentProject = updatedProjects[currentProjectIndex];
      
      const updatedScreens = currentProject.screens.map(screen => {
          // Replace existing style tag or append new one
          let newHtml = screen.html;
          if (newHtml.includes('id="design-system-styles"')) {
              newHtml = newHtml.replace(/<style id="design-system-styles">[\s\S]*?<\/style>/, `<style id="design-system-styles">${cssVariables}</style>`);
          } else {
              // Inject before </head> or at the top
              if (newHtml.includes('</head>')) {
                  newHtml = newHtml.replace('</head>', `<style id="design-system-styles">${cssVariables}</style></head>`);
              } else {
                  newHtml = `<style id="design-system-styles">${cssVariables}</style>` + newHtml;
              }
          }
          return { ...screen, html: newHtml };
      });

      updatedProjects[currentProjectIndex] = {
          ...currentProject,
          designSystem: newDs,
          screens: updatedScreens
      };
      
      updateProjects(updatedProjects);
  };

  // === Component Library Logic ===
  const handleSaveComponent = (screen: Screen) => {
      if (currentProjectIndex === -1) return;
      const newComponent: SavedComponent = {
          id: generateId(),
          name: `${screen.pageName} Component`,
          html: screen.html,
          category: 'Page',
          timestamp: Date.now()
      };
      
      const updatedProjects = [...projects];
      const currentProject = updatedProjects[currentProjectIndex];
      updatedProjects[currentProjectIndex] = {
          ...currentProject,
          savedComponents: [...(currentProject.savedComponents || []), newComponent]
      };
      updateProjects(updatedProjects);
      showToast("Component Saved to Library");
  };

  const handleUseComponent = (comp: SavedComponent) => {
      // Create a new screen from component
      if (currentProjectIndex === -1) return;
      const updatedProjects = [...projects];
      const currentProject = updatedProjects[currentProjectIndex];
      
      const newScreen: Screen = {
          id: generateId(),
          pageName: comp.name + ' Copy',
          styleName: 'Custom',
          html: comp.html,
          status: 'complete',
          x: (currentProject.screens.length) * 1400,
          y: 0
      };
      
      updatedProjects[currentProjectIndex] = {
          ...currentProject,
          screens: [...currentProject.screens, newScreen]
      };
      updateProjects(updatedProjects);
      showToast("Component Added to Canvas");
  };

  const handleDeleteComponent = (compId: string) => {
      if (currentProjectIndex === -1) return;
      const updatedProjects = [...projects];
      const currentProject = updatedProjects[currentProjectIndex];
      updatedProjects[currentProjectIndex] = {
          ...currentProject,
          savedComponents: (currentProject.savedComponents || []).filter(c => c.id !== compId)
      };
      updateProjects(updatedProjects);
  };

  const currentProject = projects[currentProjectIndex] || null;

  // Viewport Widths
  const getViewportWidth = () => {
      switch(viewportMode) {
          case 'mobile': return '375px';
          case 'tablet': return '768px';
          default: return '1280px';
      }
  };

  return (
    <div className="app-container">
        {toastMessage && <div className="copy-toast">{toastMessage}</div>}

        <Header 
            projectName={currentProject?.prompt.split('\n')[0].replace('PROJECT: ', '') || ''}
            scale={scale}
            setScale={setScale}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            viewportMode={viewportMode}
            setViewportMode={setViewportMode}
            isPreviewMode={isPreviewMode}
            setIsPreviewMode={setIsPreviewMode}
        />

        <div className="workspace">
            {/* === Left Sidebar (Layers & Library) === */}
            {!isPreviewMode && (
                <div className="sidebar-group">
                    <LayerPanel 
                        project={currentProject} 
                        selectedScreenId={selectedScreenId} 
                        onSelectScreen={setSelectedScreenId} 
                    />
                    <LibraryPanel 
                        project={currentProject}
                        onUseComponent={handleUseComponent}
                        onDeleteComponent={handleDeleteComponent}
                    />
                </div>
            )}

            {/* === Main Canvas === */}
            <main 
                className="main-canvas" 
                ref={canvasRef} 
                onWheel={handleWheel} 
                onMouseDown={handleMouseDown} 
                onMouseMove={handleMouseMove} 
                onMouseUp={handleMouseUp} 
                onMouseLeave={handleMouseUp}
                onClick={handleCanvasClick}
                style={{ 
                    cursor: activeTool === 'text' ? 'text' : undefined,
                    background: isPreviewMode ? '#000' : undefined 
                }}
            >
                <GridBackground />
                
                {/* Render Annotations */}
                {!isPreviewMode && currentProject?.annotations?.map(ann => (
                    <div 
                        key={ann.id}
                        style={{
                            position: 'absolute',
                            left: ann.x,
                            top: ann.y,
                            background: '#fff9c4',
                            color: '#333',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            maxWidth: '200px',
                            fontSize: '14px',
                            fontFamily: 'sans-serif',
                            zIndex: 100,
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                            transformOrigin: 'top left'
                        }}
                    >
                        {ann.text}
                    </div>
                ))}

                {/* Text Input Overlay */}
                {textInput && (
                    <input
                        autoFocus
                        style={{
                            position: 'absolute',
                            left: textInput.x,
                            top: textInput.y,
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                            transformOrigin: 'top left',
                            zIndex: 1000,
                            background: 'white',
                            border: '1px solid var(--accent-primary)',
                            padding: '8px',
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            minWidth: '200px'
                        }}
                        value={textInput.value}
                        onChange={e => setTextInput({ ...textInput, value: e.target.value })}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                if (textInput.value.trim()) {
                                    const newAnnotation = { id: generateId(), x: textInput.x, y: textInput.y, text: textInput.value };
                                    const updatedProjects = [...projects];
                                    const project = updatedProjects[currentProjectIndex];
                                    updatedProjects[currentProjectIndex] = {
                                        ...project,
                                        annotations: [...(project.annotations || []), newAnnotation]
                                    };
                                    updateProjects(updatedProjects);
                                }
                                setTextInput(null);
                                setActiveTool('select');
                            } else if (e.key === 'Escape') {
                                setTextInput(null);
                                setActiveTool('select');
                            }
                        }}
                        onBlur={() => {
                             if (textInput.value.trim()) {
                                const newAnnotation = { id: generateId(), x: textInput.x, y: textInput.y, text: textInput.value };
                                const updatedProjects = [...projects];
                                const project = updatedProjects[currentProjectIndex];
                                updatedProjects[currentProjectIndex] = {
                                    ...project,
                                    annotations: [...(project.annotations || []), newAnnotation]
                                };
                                updateProjects(updatedProjects);
                             }
                             setTextInput(null);
                             setActiveTool('select');
                        }}
                    />
                )}

                {/* Render Cursors */}
                {!isPreviewMode && cursors.map(cursor => (
                    <div 
                        key={cursor.id}
                        style={{
                            position: 'absolute',
                            left: cursor.x * scale + pan.x,
                            top: cursor.y * scale + pan.y,
                            pointerEvents: 'none',
                            zIndex: 1000
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={cursor.color} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                            <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19179L11.7841 12.3673H5.65376Z" />
                        </svg>
                        <div style={{ 
                            background: cursor.color, 
                            color: '#fff', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '10px',
                            marginLeft: '12px',
                            marginTop: '4px'
                        }}>
                            {cursor.name}
                        </div>
                    </div>
                ))}

                <div 
                    className="canvas-content"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        width: '100%', height: '100%',
                        position: 'relative',
                        cursor: isDragging ? 'grabbing' : activeTool === 'hand' ? 'grab' : 'default'
                    }}
                >
                    {!currentProject ? (
                        <div className="empty-state" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <SparklesIcon />
                            <h2>Design Forge</h2>
                            <p>Create a new project in the sidebar to begin.</p>
                            <button className="btn-primary" onClick={() => setDrawerState({ isOpen: true, mode: null, title: 'New Project', data: null })}>
                                Start New Project
                            </button>
                        </div>
                    ) : (
                        currentProject.screens.map((screen) => (
                            <div 
                                key={screen.id}
                                id={`screen-preview-${screen.id}`}
                                className={`screen-container ${selectedScreenId === screen.id ? 'selected' : ''}`}
                                style={{
                                    position: 'absolute',
                                    left: isPreviewMode ? '50%' : screen.x,
                                    top: isPreviewMode ? '50%' : screen.y,
                                    transform: isPreviewMode ? `translate(-50%, -50%) scale(${scale})` : undefined, // Center in preview
                                    width: getViewportWidth(), 
                                    height: '800px', 
                                    zIndex: selectedScreenId === screen.id ? 10 : 1,
                                    transition: 'all 0.3s ease',
                                    border: isPreviewMode ? 'none' : undefined,
                                    boxShadow: isPreviewMode ? 'none' : undefined
                                }}
                                onClick={(e) => {
                                    if (isPreviewMode) return;
                                    e.stopPropagation();
                                    setSelectedScreenId(screen.id);
                                }}
                            >
                                {!isPreviewMode && (
                                    <div className="screen-header">
                                        <div className="window-controls">
                                            <div className="window-dot red" />
                                            <div className="window-dot yellow" />
                                            <div className="window-dot green" />
                                        </div>
                                        <div className="screen-url-bar">
                                            https://{screen.pageName.toLowerCase().replace(/\s/g, '-')}.app
                                        </div>
                                        <div className="screen-actions">
                                            <button className="action-btn" onClick={() => handleSaveComponent(screen)} title="Save to Library"><SparklesIcon /></button>
                                            <button className="action-btn" onClick={() => handleCopyToFigma(screen.id)} title="Copy for Figma (SVG)"><CodeIcon /></button>
                                            <button className="action-btn" onClick={() => handleDownloadHTML(screen.html, screen.id)} title="Download"><DownloadIcon /></button>
                                            <button className="action-btn" onClick={() => handleRefine(screen)} title="Refine"><ArrowRightIcon /></button>
                                        </div>
                                    </div>
                                )}
                                <div className="screen-preview" style={{ width: '100%', height: isPreviewMode ? '100%' : 'calc(100% - 40px)', background: '#fff' }}>
                                    <iframe 
                                        srcDoc={screen.html} 
                                        style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            border: 'none', 
                                            pointerEvents: isPreviewMode ? 'auto' : 'none' 
                                        }} 
                                        title={screen.pageName}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* === Right Sidebar (Properties) === */}
            {!isPreviewMode && (
                <PropertiesPanel 
                    project={currentProject} 
                    selectedScreenId={selectedScreenId} 
                    onUpdateDesignSystem={handleUpdateDesignSystem} 
                />
            )}
        </div>

        {!isPreviewMode && (
            <Toolbar 
                activeTool={activeTool} 
                setActiveTool={setActiveTool} 
                onUndo={handleUndo} 
                onRedo={handleRedo} 
                canUndo={historyIndex > 0} 
                canRedo={historyIndex < history.length - 1} 
                scale={scale} 
                setScale={setScale} 
                projectName={currentProject?.prompt.split('\n')[0].replace('PROJECT: ', '') || ''}
                disabled={!currentProject}
            />
        )}

        {/* === Side Drawer (New Project / Refine) === */}
        <SideDrawer 
            isOpen={drawerState.isOpen} 
            onClose={() => setDrawerState(s => ({...s, isOpen: false}))} 
            title={drawerState.title}
        >
            {drawerState.mode === 'refine' ? (
                <div className="refine-container">
                    <p className="refine-instruction">
                        Describe changes (e.g., "Make the footer dark", "Add a pricing section").
                    </p>
                    <textarea 
                        className="refine-textarea"
                        value={refineInput}
                        onChange={(e) => setRefineInput(e.target.value)}
                        placeholder="Enter your design feedback..."
                        autoFocus
                    />
                    <button className="refine-submit-btn" onClick={submitRefinement} disabled={!refineInput.trim()}>
                        APPLY CHANGES <ArrowRightIcon />
                    </button>
                </div>
            ) : (
                <div className="sidebar-content">
                    <div className="form-group">
                        <label className="label">Design Brief (Required)</label>
                        <textarea 
                            className="input-field" 
                            placeholder="Describe the website you want to build..." 
                            value={promptInput}
                            onChange={(e) => setPromptInput(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Brand Name</label>
                        <input 
                            className="input-field" 
                            placeholder="e.g. Acme Corp" 
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Target Audience</label>
                        <input 
                            className="input-field" 
                            placeholder="e.g. Designers, Developers" 
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Reference URL</label>
                        <input 
                            className="input-field" 
                            placeholder="https://..." 
                            value={referenceUrl}
                            onChange={(e) => setReferenceUrl(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Aesthetic Style</label>
                        <div className="style-grid">
                            {STYLES.map(s => (
                                <button 
                                    key={s.id} 
                                    className={`style-btn ${selectedStyle === s.id ? 'active' : ''}`}
                                    onClick={() => setSelectedStyle(s.id)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button 
                        className="btn-primary" 
                        onClick={() => {
                            setDrawerState(s => ({ ...s, isOpen: false }));
                            generateProject();
                        }} 
                        disabled={isLoading || !promptInput.trim()}
                    >
                        {isLoading ? <span className="loading-spinner" /> : <SparklesIcon />}
                        {isLoading ? 'GENERATING...' : 'GENERATE PROJECT'}
                    </button>
                </div>
            )}
        </SideDrawer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
