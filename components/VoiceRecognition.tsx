'use client';

import { useState, useEffect, useRef } from 'react';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

interface VoiceRecognitionProps {
  onTranscript: (text: string) => void;
  onSearch: (query: string) => void;
}

export default function VoiceRecognition({ onTranscript, onSearch }: VoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // SpeechRecognition API 지원 확인
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as unknown as Window).SpeechRecognition || 
                                (window as unknown as Window).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setError('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.');
        return;
      }

      const recognition = new SpeechRecognition() as SpeechRecognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';
      recognition.maxAlternatives = 3;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        setTranscript(fullTranscript.trim());
        onTranscript(fullTranscript.trim());

        // 최종 결과가 있으면 검색 실행
        if (finalTranscript.trim()) {
          onSearch(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log('Speech recognition error:', event.error);
        
        // 재시작하지 않아야 하는 에러들
        // const noRestartErrors = ['aborted', 'not-allowed', 'no-speech'];
        const noRestartErrors = ['not-allowed'];
        
        if (noRestartErrors.includes(event.error)) {
          console.log(`음성 인식 오류: ${event.error}`);
          setIsListening(false);
          shouldRestartRef.current = false;
          return;
        }
        
        // 그 외 에러는 재시작 시도
        console.log(`음성 인식 오류: ${event.error} - 재시작 중...`);
        
        // 에러 발생 시 약간의 딜레이 후 재시작
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldRestartRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.error('Failed to restart recognition:', err);
              setIsListening(false);
              shouldRestartRef.current = false;
            }
          }
        }, 1000);
      };

      recognition.onend = () => {
        // 사용자가 수동으로 중지한 경우가 아니면 재시작
        if (shouldRestartRef.current) {
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldRestartRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {
                console.error('Failed to restart recognition:', err);
                setIsListening(false);
                shouldRestartRef.current = false;
              }
            }
          }, 1000);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      shouldRestartRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, onSearch]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        shouldRestartRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('음성 인식을 시작할 수 없습니다.');
        shouldRestartRef.current = false;
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      shouldRestartRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isListening ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </span>
          )}
        </button>

        {error && (
          <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {transcript && (
          <div className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">인식된 텍스트:</p>
            <p className="text-lg text-gray-900 dark:text-gray-100">{transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
}

