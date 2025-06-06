import { useState } from 'react';
import Button from '../ui/button/Button';
import { CodeIcon } from '../../icons';

interface FormShortcodeProps {
  formId: string;
}

export default function FormShortcode({ formId }: FormShortcodeProps) {
  const [copied, setCopied] = useState(false);
  const shortcode = `[form id="${formId}"]`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300">
        {shortcode}
      </div>
      <Button
        onClick={handleCopy}
        variant="outline"
        className="min-w-[100px]"
      >
        <CodeIcon className="w-5 h-5 mr-2" />
        {copied ? "Copiado!" : "Copiar"}
      </Button>
    </div>
  );
}