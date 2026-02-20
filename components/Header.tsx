import React from 'react';
import { Sofa, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-700 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Sofa className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">RoomVision AI</h1>
            <p className="text-xs text-slate-400">Powered by Gemini 2.5</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-300">
          <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
            <Sparkles className="w-4 h-4" /> Feature: Smart Lighting Match
          </span>
          <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
            <Sparkles className="w-4 h-4" /> Feature: Perspective Correction
          </span>
        </div>
      </div>
    </header>
  );
};
