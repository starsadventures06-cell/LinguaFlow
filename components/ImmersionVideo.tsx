import React, { useState, useRef, useEffect } from 'react';
import { generateImmersionVideo } from '../services/veoService';
import { Video, Upload, Play, AlertCircle, Key } from 'lucide-react';

const ImmersionVideo: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Make this scene come alive naturally');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const keySelected = await window.aistudio.hasSelectedApiKey();
        setHasKey(keySelected);
    }
  };

  const handleSelectKey = async () => {
      if (window.aistudio && window.aistudio.openSelectKey) {
          await window.aistudio.openSelectKey();
          await checkKey();
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result as string);
      setVideoUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!originalImage || !hasKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const base64Data = originalImage.split(',')[1];
      const mimeType = originalImage.split(';')[0].split(':')[1];
      
      const url = await generateImmersionVideo(base64Data, mimeType, prompt);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate video. Try checking your API key billing.");
      if (err.message?.includes("Requested entity was not found")) {
           setHasKey(false); // Reset key state to force re-selection if invalid
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasKey) {
      return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
              <div className="p-4 bg-amber-50 rounded-full">
                  <Key className="w-12 h-12 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">API Key Required</h2>
                <p className="text-slate-500 max-w-md mt-2">To use Veo video generation, you need to select a funded API key project.</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button 
                    onClick={handleSelectKey}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Select API Key
                </button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">
                    Read about billing
                </a>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Immersion Video</h2>
        <p className="text-slate-500">Transform static images into 16:9 cinematic videos using Veo.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
               <div className="flex flex-col md:flex-row gap-6">
                   <div className="flex-1 space-y-4">
                        <label className="block font-medium text-slate-700">Source Image</label>
                        <div 
                            className="border-2 border-dashed border-slate-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {originalImage ? (
                                <img src={originalImage} alt="Source" className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <div className="text-center">
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <span className="text-sm text-slate-500">Upload image</span>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                   </div>

                   <div className="flex-1 space-y-4">
                        <label className="block font-medium text-slate-700">Animation Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-48 p-3 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Describe how the scene should move..."
                        />
                   </div>
               </div>
               
               <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={!originalImage || isLoading}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2 transition-all"
                    >
                        {isLoading ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Generating (this takes a minute)...</span></>
                        ) : (
                            <><Video className="w-5 h-5"/><span>Generate Video</span></>
                        )}
                    </button>
               </div>
               {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-2"/>{error}</div>}
          </div>

          {/* Video Result Area */}
          <div className="bg-slate-900 min-h-[400px] flex items-center justify-center p-4">
                {videoUrl ? (
                    <video 
                        src={videoUrl} 
                        controls 
                        autoPlay 
                        loop 
                        className="w-full max-h-[500px] rounded-lg shadow-2xl"
                    />
                ) : (
                    <div className="text-center text-slate-500">
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Generated video will play here</p>
                    </div>
                )}
          </div>
      </div>
    </div>
  );
};

export default ImmersionVideo;