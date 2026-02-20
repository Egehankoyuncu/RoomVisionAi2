import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, BrainCircuit } from 'lucide-react';
import { ProcessingStep } from '../types';
import { PROCESSING_STEPS } from '../constants';

interface ProcessingViewProps {
  onComplete: () => void;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ onComplete }) => {
  const [steps, setSteps] = useState<ProcessingStep[]>(
    PROCESSING_STEPS.map(s => ({ ...s, status: 'pending' } as ProcessingStep))
  );

  useEffect(() => {
    let currentStepIndex = 0;

    const interval = setInterval(() => {
      // Capture the index for this specific tick to avoid closure/async mutation issues
      const stepIndex = currentStepIndex;

      setSteps(prev => {
        // Create new object references to avoid direct mutation
        const newSteps = prev.map(step => ({ ...step }));
        
        // Mark previous step as completed
        if (stepIndex > 0) {
          const prevIndex = stepIndex - 1;
          if (newSteps[prevIndex]) {
            newSteps[prevIndex].status = 'completed';
          }
        }

        // Mark current step as active
        if (stepIndex < newSteps.length) {
          newSteps[stepIndex].status = 'active';
        }

        return newSteps;
      });

      currentStepIndex++;

      if (currentStepIndex > PROCESSING_STEPS.length) {
        clearInterval(interval);
        // Wait a small moment after final step before calling onComplete
        setTimeout(onComplete, 500);
      }
    }, 1200); // Simulate processing time for each step

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <BrainCircuit className="w-16 h-16 text-indigo-400 relative z-10 animate-bounce-slow" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-6">Generating Scene</h2>
      
      <div className="w-full max-w-md space-y-4">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
              step.status === 'active' 
                ? 'bg-slate-800 border border-indigo-500/50 translate-x-2' 
                : 'bg-transparent border border-transparent'
            }`}
          >
            <div className="flex-shrink-0">
              {step.status === 'completed' ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : step.status === 'active' ? (
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-700" />
              )}
            </div>
            <span className={`text-sm font-medium transition-colors ${
              step.status === 'pending' ? 'text-slate-500' : 'text-slate-200'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};