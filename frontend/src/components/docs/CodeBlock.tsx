'use client';

import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'bash', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {title && (
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          <span className="text-xs text-gray-500 uppercase">{language}</span>
        </div>
      )}
      <div className="relative bg-gray-900">
        <button
          onClick={copyToClipboard}
          className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          title="Copy code"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm text-gray-100 font-mono">{code}</code>
        </pre>
      </div>
    </div>
  );
}

