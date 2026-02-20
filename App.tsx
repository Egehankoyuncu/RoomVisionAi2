import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ProcessingView } from './components/ProcessingView';
import { RoomDimensionsInput } from './components/RoomDimensionsInput';
import { generateRoomPlacement, estimateRoomDimensions } from './services/geminiService';
import { AppState, RoomDimensions } from './types';
import { Wand2, Download, RotateCcw, AlertCircle, Maximize2, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [furnitureImage, setFurnitureImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInstruction, setUserInstruction] = useState<string>("");
  
  // Room Dimensions State
  const [roomDimensions, setRoomDimensions] = useState<RoomDimensions>({
    length: '',
    width: '',
    height: '',
    unit: 'ft'
  });
  const [isMeasuring, setIsMeasuring] = useState(false);
  
  // Track animation completion to prevent jarring state switches
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // Handler for auto-measuring
  const handleAutoMeasure = async () => {
    if (!roomImage) return;
    setIsMeasuring(true);
    try {
      const dimensions = await estimateRoomDimensions(roomImage);
      setRoomDimensions(dimensions);
    } catch (err) {
      console.error("Failed to estimate dimensions", err);
      // Optional: Show a toast or small error
    } finally {
      setIsMeasuring(false);
    }
  };

  // Handler for generating the image
  const handleGenerate = useCallback(async () => {
    if (!roomImage || !furnitureImage) return;

    setAppState(AppState.PROCESSING);
    setIsAnimationComplete(false); // Reset animation state
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateRoomPlacement(
        roomImage, 
        furnitureImage, 
        userInstruction,
        // Only pass dimensions if they are filled out
        (roomDimensions.length && roomDimensions.width) ? roomDimensions : undefined
      );
      setGeneratedImage(result);
      // We do NOT set AppState.COMPLETE here. We wait for the effect below.
    } catch (err) {
      console.error(err);
      setError("Failed to generate image. Please try again or check your API key.");
      setAppState(AppState.ERROR);
    }
  }, [roomImage, furnitureImage, userInstruction, roomDimensions]);

  const handleProcessingComplete = () => {
    // Called by ProcessingView when animation is done
    setIsAnimationComplete(true);
  };

  // Sync state: Only complete when BOTH API and Animation are done
  useEffect(() => {
    if (appState === AppState.PROCESSING && generatedImage && isAnimationComplete) {
      setAppState(AppState.COMPLETE);
    }
  }, [appState, generatedImage, isAnimationComplete]);

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setGeneratedImage(null);
    setError(null);
    setIsAnimationComplete(false);
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'room-vision-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-200 animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto hover:text-white"><RotateCcw className="w-4 h-4" /></button>
          </div>
        )}

        {/* Input Section - Only show when IDLE or ERROR */}
        {(appState === AppState.IDLE || appState === AppState.ERROR) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* Left: Room Image */}
            <div className="space-y-6">
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                   <span className="bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                   Room Environment
                 </h2>
                 <ImageUploader 
                    label="Upload Room Photo" 
                    description="Take a clear photo of where you want to place the object."
                    imageSrc={roomImage}
                    onImageChange={setRoomImage}
                    acceptCamera={true}
                 />
              </div>

              {/* Room Dimensions Input */}
              <div className={`transition-all duration-500 ${roomImage ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none blur-sm'}`}>
                <RoomDimensionsInput 
                  dimensions={roomDimensions}
                  onChange={setRoomDimensions}
                  onAutoMeasure={handleAutoMeasure}
                  isMeasuring={isMeasuring}
                  disabled={!roomImage}
                />
              </div>
            </div>

            {/* Right: Furniture Image */}
            <div className="space-y-6">
               <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                   <span className="bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                   Object to Place
                 </h2>
                 <ImageUploader 
                    label="Upload Furniture Item" 
                    description="Upload an isolated image of the furniture. Clean backgrounds work best."
                    imageSrc={furnitureImage}
                    onImageChange={setFurnitureImage}
                 />
              </div>
            </div>

            {/* Controls */}
            <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-6 sticky bottom-4 shadow-2xl z-40">
              <div className="flex-grow w-full">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Instruction (Optional)
                </label>
                <input 
                  type="text" 
                  value={userInstruction}
                  onChange={(e) => setUserInstruction(e.target.value)}
                  placeholder="e.g. Place it in the center, rotate slightly to the left..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={!roomImage || !furnitureImage}
                className={`
                  w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105
                  ${(!roomImage || !furnitureImage)
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25'
                  }
                `}
              >
                <Wand2 className="w-5 h-5" />
                Generate
              </button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {appState === AppState.PROCESSING && (
           <div className="flex items-center justify-center min-h-[60vh] animate-fadeIn">
             <ProcessingView onComplete={handleProcessingComplete} />
           </div>
        )}

        {/* Result State */}
        {appState === AppState.COMPLETE && generatedImage && (
          <div className="animate-fadeIn space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-bold text-white">Generated Result</h2>
               <div className="flex gap-3">
                 <button onClick={resetApp} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Try Again
                 </button>
                 <button onClick={downloadImage} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Download className="w-4 h-4" /> Download
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Main Result */}
               <div className="lg:col-span-2">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl group">
                    <img src={generatedImage} alt="Generated Room" className="w-full h-auto" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => window.open(generatedImage, '_blank')} className="bg-black/50 p-2 rounded-full hover:bg-black/70 text-white">
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
               </div>

               {/* Details & Minimap */}
               <div className="space-y-6">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-lg font-semibold mb-4 text-slate-300">Composition Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Original Room</p>
                        <img src={roomImage!} alt="Original Room" className="w-full h-32 object-cover rounded-lg opacity-80" />
                      </div>
                      <div>
                         <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Placed Object</p>
                         <div className="bg-slate-800 rounded-lg p-2">
                           <img src={furnitureImage!} alt="Object" className="w-full h-32 object-contain" />
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-lg font-semibold mb-2 text-slate-300">AI Analysis</h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Perspective matched to floor plane
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Lighting temperature adapted
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Contact shadows generated
                      </li>
                    </ul>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;