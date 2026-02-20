import React, { useState } from 'react';
import { Ruler, Scan, Loader2, Sparkles } from 'lucide-react';
import { RoomDimensions } from '../types';

interface RoomDimensionsInputProps {
  dimensions: RoomDimensions;
  onChange: (dimensions: RoomDimensions) => void;
  onAutoMeasure: () => Promise<void>;
  isMeasuring: boolean;
  disabled?: boolean;
}

export const RoomDimensionsInput: React.FC<RoomDimensionsInputProps> = ({
  dimensions,
  onChange,
  onAutoMeasure,
  isMeasuring,
  disabled = false
}) => {
  const handleChange = (field: keyof RoomDimensions, value: string) => {
    onChange({ ...dimensions, [field]: value });
  };

  return (
    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
          <Ruler className="w-5 h-5 text-indigo-400" />
          Room Dimensions
        </h3>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => handleChange('unit', 'ft')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              dimensions.unit === 'ft' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FT
          </button>
          <button
            onClick={() => handleChange('unit', 'm')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              dimensions.unit === 'm' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            M
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Length</label>
          <div className="relative">
            <input
              type="number"
              value={dimensions.length}
              onChange={(e) => handleChange('length', e.target.value)}
              disabled={disabled || isMeasuring}
              placeholder="0"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder-slate-600"
            />
            <span className="absolute right-3 top-2 text-slate-500 text-sm">{dimensions.unit}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Width</label>
          <div className="relative">
            <input
              type="number"
              value={dimensions.width}
              onChange={(e) => handleChange('width', e.target.value)}
              disabled={disabled || isMeasuring}
              placeholder="0"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder-slate-600"
            />
            <span className="absolute right-3 top-2 text-slate-500 text-sm">{dimensions.unit}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Height</label>
          <div className="relative">
            <input
              type="number"
              value={dimensions.height}
              onChange={(e) => handleChange('height', e.target.value)}
              disabled={disabled || isMeasuring}
              placeholder="0"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder-slate-600"
            />
            <span className="absolute right-3 top-2 text-slate-500 text-sm">{dimensions.unit}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onAutoMeasure}
        disabled={disabled || isMeasuring}
        className={`
          w-full mt-2 py-3 px-4 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 
          hover:bg-indigo-500/10 hover:border-indigo-500/50 text-indigo-300 font-medium text-sm
          flex items-center justify-center gap-2 transition-all group
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isMeasuring ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Scanning Room Geometry...
          </>
        ) : (
          <>
            <Scan className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-violet-300">
              Auto-Measure with AI
            </span>
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </>
        )}
      </button>
      
      <p className="text-xs text-slate-500 text-center">
        AI estimates dimensions based on standard ceiling heights and visual cues.
      </p>
    </div>
  );
};
