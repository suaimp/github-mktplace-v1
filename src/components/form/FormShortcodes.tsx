import { useState, useEffect } from 'react';
import Button from '../ui/button/Button';
import { CodeIcon } from '../../icons';

interface FormShortcodesProps {
  formId: string;
}

export default function FormShortcodes({ formId }: FormShortcodesProps) {
  const [copiedForm, setCopiedForm] = useState(false);
  const [copiedEntries, setCopiedEntries] = useState(false);
  const [copiedUserEntries, setCopiedUserEntries] = useState(false);
  const [copiedMarketplace, setCopiedMarketplace] = useState(false);

  const formShortcode = `[form id="${formId}"]`;
  const entriesShortcode = `[form_entries id="${formId}"]`;
  const userEntriesShortcode = `[user_form_entries id="${formId}"]`;
  const marketplaceShortcode = `[marketplace id="${formId}"]`;

  const handleCopy = async (shortcode: string, type: 'form' | 'entries' | 'user_entries' | 'marketplace') => {
    try {
      await navigator.clipboard.writeText(shortcode);
      if (type === 'form') {
        setCopiedForm(true);
        setTimeout(() => setCopiedForm(false), 2000);
      } else if (type === 'entries') {
        setCopiedEntries(true);
        setTimeout(() => setCopiedEntries(false), 2000);
      } else if (type === 'user_entries') {
        setCopiedUserEntries(true);
        setTimeout(() => setCopiedUserEntries(false), 2000);
      } else if (type === 'marketplace') {
        setCopiedMarketplace(true);
        setTimeout(() => setCopiedMarketplace(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300">
          {formShortcode}
        </div>
        <Button
          onClick={() => handleCopy(formShortcode, 'form')}
          variant="outline"
          className="min-w-[100px]"
        >
          <CodeIcon className="w-5 h-5 mr-2" />
          {copiedForm ? "Copiado!" : "Copiar"}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300">
          {entriesShortcode}
        </div>
        <Button
          onClick={() => handleCopy(entriesShortcode, 'entries')}
          variant="outline"
          className="min-w-[100px]"
        >
          <CodeIcon className="w-5 h-5 mr-2" />
          {copiedEntries ? "Copiado!" : "Copiar"}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300">
          {userEntriesShortcode}
        </div>
        <Button
          onClick={() => handleCopy(userEntriesShortcode, 'user_entries')}
          variant="outline"
          className="min-w-[100px]"
        >
          <CodeIcon className="w-5 h-5 mr-2" />
          {copiedUserEntries ? "Copiado!" : "Copiar"}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300">
          {marketplaceShortcode}
        </div>
        <Button
          onClick={() => handleCopy(marketplaceShortcode, 'marketplace')}
          variant="outline"
          className="min-w-[100px]"
        >
          <CodeIcon className="w-5 h-5 mr-2" />
          {copiedMarketplace ? "Copiado!" : "Copiar"}
        </Button>
      </div>
      
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        <p><strong>Shortcodes:</strong></p>
        <ul className="list-disc pl-5 mt-1">
          <li><code>[form id="..."]</code> - Exibe o formulário para preenchimento</li>
          <li><code>[form_entries id="..."]</code> - Exibe todas as entradas do formulário</li>
          <li><code>[user_form_entries id="..."]</code> - Exibe apenas as entradas enviadas pelo usuário atual</li>
          <li><code>[marketplace id="..."]</code> - Exibe as entradas verificadas em formato de marketplace</li>
        </ul>
      </div>
    </div>
  );
}