'use client';

import { useState } from 'react';

interface VerseResultsProps {
  results: string[];
  query: string;
  isLoading?: boolean;
  onVerseSelect?: (verse: string) => void;
  presentationMode?: boolean;
  onTogglePresentation?: () => void;
}

export default function VerseResults({ results, query, isLoading, onVerseSelect, presentationMode = false, onTogglePresentation }: VerseResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">검색 중...</span>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-4">
      <div className="flex items-center justify-between mb-4">
        {query && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            &quot;{query}&quot; 검색 결과 ({results.length}개)
          </div>
        )}
        {onTogglePresentation && (
          <button
            onClick={onTogglePresentation}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              presentationMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title={presentationMode ? '프레젠테이션 모드 끄기' : '프레젠테이션 모드 켜기'}
          >
            <span className="flex items-center gap-2">
              {presentationMode ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </>
              )}
            </span>
          </button>
        )}
      </div>
      <div className="space-y-3">
        {results.map((verse, index) => (
          <div
            key={index}
            className="relative p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onVerseSelect?.(verse)}
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(verse, index);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="복사"
              >
                {copiedIndex === index ? (
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap pr-16">
              {verse}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

