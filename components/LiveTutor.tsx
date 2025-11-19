import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Volume2, Loader2, MessageSquare } from 'lucide-react';
import { createPcmBlob, decodeAudioData, base64ToBytes } from '../services/audioUtils';

const LiveTutor: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready to start session");
  const [transcription, setTranscription] = useState<Array<{role: string, text: string}>>([]);

  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Playback timing
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session Management
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    
    // Reset refs
    streamRef.current = null;
    processorRef.current = null;
    sourceRef.current = null;
    inputContextRef.current = null;
    audioContextRef.current = null;
    sessionPromiseRef.current = null;
    nextStartTimeRef.current = 0;
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setStatus("Initializing audio...");

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      inputContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      
      const outputNode = audioContextRef.current.createGain();
      outputNode.connect(audioContextRef.current.destination);

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setStatus("Connecting to Gemini Live...");

      // Connect to Live API
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Connection opened");
            setIsConnected(true);
            setIsConnecting(false);
            setStatus("Connected! Start speaking.");
            
            // Start Audio Input Processing
            if (!inputContextRef.current) return;

            const source = inputContextRef.current.createMediaStreamSource(stream);
            const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };

            source.connect(processor);
            processor.connect(inputContextRef.current.destination);
            
            sourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Transcription
             if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                setTranscription(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'model') {
                        return [...prev.slice(0, -1), { role: 'model', text: last.text + text }];
                    }
                    return [...prev, { role: 'model', text }];
                });
             }

             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
             if (base64Audio && audioContextRef.current) {
                const ctx = audioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                    base64ToBytes(base64Audio),
                    ctx,
                    24000,
                    1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                
                source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                });
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
             }
             
             // Handle Interruption
             if (message.serverContent?.interrupted) {
                 sourcesRef.current.forEach(s => s.stop());
                 sourcesRef.current.clear();
                 nextStartTimeRef.current = 0;
             }
          },
          onclose: () => {
            console.log("Connection closed");
            setIsConnected(false);
            setStatus("Session ended");
          },
          onerror: (e) => {
            console.error("Session error", e);
            setError("Connection error occurred.");
            setIsConnected(false);
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: "You are a friendly and patient language tutor named 'Sasha'. You help the user practice conversation. Correct them gently if they make mistakes, but prioritize flowing conversation. Keep responses relatively concise.",
        }
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start session");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    cleanup();
    setIsConnected(false);
    setStatus("Session stopped");
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Conversational Practice</h2>
        <p className="text-slate-500">Speak naturally with your AI tutor to improve fluency.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[300px] border border-slate-100 relative overflow-hidden">
         {/* Visualizer Background Effect */}
         {isConnected && (
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-64 h-64 bg-indigo-500 rounded-full animate-pulse blur-3xl"></div>
            </div>
         )}

         <div className="z-10 flex flex-col items-center space-y-6">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isConnected ? 'bg-indigo-100 ring-4 ring-indigo-50' : 'bg-slate-100'}`}>
                {isConnecting ? (
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                ) : isConnected ? (
                    <Volume2 className="w-12 h-12 text-indigo-600 animate-bounce" />
                ) : (
                    <MicOff className="w-12 h-12 text-slate-400" />
                )}
            </div>
            
            <div className="text-center">
                <p className={`text-lg font-medium ${isConnected ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {status}
                </p>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <button
                onClick={isConnected ? stopSession : startSession}
                disabled={isConnecting}
                className={`px-8 py-3 rounded-full font-semibold text-white shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isConnected 
                    ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
            >
                {isConnected ? (
                    <><span>End Session</span></>
                ) : (
                    <><Mic className="w-5 h-5" /><span>Start Conversation</span></>
                )}
            </button>
         </div>
      </div>

      {/* Live Transcript - Optional but helpful */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-4 flex-1 overflow-hidden flex flex-col h-64">
         <div className="flex items-center space-x-2 mb-3 text-slate-500">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Live Transcript</span>
         </div>
         <div className="overflow-y-auto space-y-3 flex-1 pr-2">
             {transcription.length === 0 && <p className="text-slate-400 italic text-sm">Transcript will appear here...</p>}
             {transcription.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'model' ? 'justify-start' : 'justify-end'}`}>
                     <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                         msg.role === 'model' 
                         ? 'bg-slate-100 text-slate-800 rounded-tl-none' 
                         : 'bg-indigo-50 text-indigo-900 rounded-tr-none'
                     }`}>
                         {msg.text}
                     </div>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
};

export default LiveTutor;