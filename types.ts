/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface DesignSystem {
    colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        accent: string;
    };
    typography: {
        headingFont: string;
        bodyFont: string;
        scale: number;
    };
    spacing: {
        base: number;
        scale: number;
    };
    borderRadius: number;
    shadows?: {
        small: string;
        medium: string;
        large: string;
    };
    layout?: {
        maxWidth: number;
    };
}

export interface Screen {
  id: string;
  pageName: string;
  styleName: string;
  html: string;
  status: 'streaming' | 'complete' | 'error';
  x: number; // Canvas position X
  y: number; // Canvas position Y
}

export interface SavedComponent {
    id: string;
    name: string;
    html: string;
    category: string;
    timestamp: number;
}

export interface Annotation {
    id: string;
    x: number;
    y: number;
    text: string;
    screenId?: string;
}

export interface Project {
    id: string;
    prompt: string;
    timestamp: number;
    screens: Screen[];
    designSystem?: DesignSystem;
    savedComponents?: SavedComponent[];
    annotations?: Annotation[];
}

export interface ComponentVariation { name: string; html: string; }
export interface LayoutOption { name: string; css: string; previewHtml: string; }

export interface UserCursor {
    id: string;
    x: number;
    y: number;
    color: string;
    name: string;
}
