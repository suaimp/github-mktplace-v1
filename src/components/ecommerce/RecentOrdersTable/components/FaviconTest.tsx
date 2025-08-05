import React from 'react';
import { getFaviconUrl } from '../services/FaviconService';

// Componente para testar favicons
export const FaviconTest: React.FC = () => {
  const testUrls = [
    'https://google.com',
    'https://facebook.com',
    'https://github.com',
    'https://stackoverflow.com'
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Teste de Favicons</h3>
      <div className="flex gap-4">
        {testUrls.map((url, index) => (
          <div key={index} className="text-center">
            <img
              src={getFaviconUrl(url)}
              alt={`Favicon ${url}`}
              className="w-8 h-8 rounded border border-gray-200"
              onError={(e) => {
                console.log(`Erro ao carregar favicon para ${url}`);
                const target = e.target as HTMLImageElement;
                target.style.backgroundColor = '#f3f4f6';
              }}
              onLoad={() => {
                console.log(`Favicon carregado com sucesso para ${url}`);
              }}
            />
            <p className="text-xs mt-1">{url.replace('https://', '')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
