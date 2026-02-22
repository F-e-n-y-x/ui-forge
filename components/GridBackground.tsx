/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export default function GridBackground() {
  return (
    <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
    }}>
        {/* Technical Dot Grid */}
        <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.3
        }} />
        
        {/* Subtle Vignette */}
        <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 0%, #09090b 100%)'
        }} />
    </div>
  );
}
