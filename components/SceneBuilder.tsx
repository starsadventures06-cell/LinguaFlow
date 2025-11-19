import React, { useState, useRef } from 'react';
import { generateImageEdit } from '../services/geminiService';
import { Image as ImageIcon, Wand2, Upload, Download, ArrowRight } from 'lucide-react';

const SceneBuilder: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result as string);
      setGeneratedImage(null); // Reset generated image when new one uploads
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt) return;

    setIsLoading(true);
    setError(null);

    try {
      // Extract base64 data from data URL
      const base64Data = originalImage.split(',')[1];
      const mimeType = originalImage.split(';')[0].split(':')[1];
      
      const resultDataUrl = await generateImageEdit(base64Data, prompt, mimeType);
      setGeneratedImage(resultDataUrl);
    } catch (err: any) {
      setError(err.message || "Failed to edit image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Contextual Scene Builder</h2>
        <p className="text-slate-500">Create visual aids for your vocabulary. Upload a scene and modify it with your target language concepts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-lg mb-4 flex items-center"><Upload className="w-5 h-5 mr-2 text-indigo-600"/> 1. Upload Source</h3>
                <div 
                    className="border-2 border-dashed border-slate-300 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {originalImage ? (
                        <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center p-4">
                            <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Click to upload a photo</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    {originalImage && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white font-medium">Change Image</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                 <h3 className="font-semibold text-lg mb-4 flex items-center"><Wand2 className="w-5 h-5 mr-2 text-indigo-600"/> 2. Describe Changes</h3>
                 <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">What should happen?</label>
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Add a retro filter, Remove the chair, Make it snowy"
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                     </div>
                     <button 
                        onClick={handleEdit}
                        disabled={!originalImage || !prompt || isLoading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                     >
                        {isLoading ? <span className="animate-pulse">Processing...</span> : 'Generate Edit'}
                     </button>
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                 </div>
            </div>
        </div>

        {/* Output Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
             <h3 className="font-semibold text-lg mb-4 flex items-center text-indigo-600">Result</h3>
             <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden min-h-[400px]">
                 {isLoading ? (
                     <div className="text-center">
                         <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                         <p className="text-slate-500">Applying AI magic...</p>
                     </div>
                 ) : generatedImage ? (
                     <div className="relative group w-full h-full">
                         <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                         <a 
                            href={generatedImage} 
                            download="lingua-flow-edit.png"
                            className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                         >
                             <Download className="w-5 h-5 text-slate-800" />
                         </a>
                     </div>
                 ) : (
                     <div className="text-center text-slate-400 p-8">
                         <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                         <p>Your generated image will appear here</p>
                     </div>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default SceneBuilder;