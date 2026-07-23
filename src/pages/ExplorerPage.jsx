import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Timeline from '../components/Timeline/Timeline';
import Sidebar from '../components/Sidebar/Sidebar';
import Dashboard from '../components/Dashboard/Dashboard';

export default function ExplorerPage() {
  const [selectedId, setSelectedId] = useState(null);
  
  // Próximamente: view = 'timeline' | 'genealogy' | 'map' | 'covenants'
  const [view, setView] = useState('timeline'); 

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950 font-sans">
      
      {/* Área del Canvas (Izquierda) */}
      <div className="flex-1 relative">
        <Dashboard />
        
        {/* Controles de Vista (Fase 1: Solo Timeline por ahora) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 rounded-full p-1 flex gap-1 z-50 shadow-2xl border border-gray-700">
          <button className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'timeline' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Timeline</button>
          <button disabled className="px-4 py-2 rounded-full text-sm font-medium text-gray-600">Genealogía (Fase 4)</button>
          <button disabled className="px-4 py-2 rounded-full text-sm font-medium text-gray-600">Mapa (Fase 7)</button>
        </div>

        {/* Canvas Interactuable (Google Maps Style) */}
        <TransformWrapper
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
          minScale={0.1}
          maxScale={5}
          wheel={{ step: 0.1 }}
          limitToBounds={false}
        >
          <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
            {view === 'timeline' && (
              <Timeline 
                selectedId={selectedId} 
                onSelect={(id) => setSelectedId(id)} 
              />
            )}
            {/* Aquí entrará ReactFlow en FASE 4 */}
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Panel Lateral (Derecha) */}
      {selectedId && (
        <Sidebar 
          selectedId={selectedId} 
          onClose={() => setSelectedId(null)}
          onSelect={(id) => setSelectedId(id)}
        />
      )}
    </div>
  );
}