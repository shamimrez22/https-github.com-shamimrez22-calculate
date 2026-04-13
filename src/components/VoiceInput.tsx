import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface VoiceInputProps {
  onResult: (text: string) => void;
  className?: string;
  language?: string;
}

export default function VoiceInput({ onResult, className, language = 'bn-BD' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <button
        type="button"
        onClick={startListening}
        disabled={isListening}
        className={cn(
          "p-2 rounded-none border-2 border-black transition-all flex items-center justify-center",
          isListening ? "bg-[#2FA084] text-white animate-pulse" : "bg-white text-black hover:bg-[#E2E8F0]"
        )}
        title={isListening ? "Listening..." : "Start Voice Input"}
      >
        {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
      </button>
      {error && (
        <div className="absolute bottom-full mb-2 left-0 bg-red-50 text-[#2FA084] text-[8px] font-black uppercase tracking-widest px-2 py-1 border border-[#2FA084] whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
}
