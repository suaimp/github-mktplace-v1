import React from 'react';

interface SectionFieldProps {
  field: {
    label: string;
    description?: string;
  };
}

export default function SectionField({ field }: SectionFieldProps) {
  return (
    <div className="w-full">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
        {field.label}
      </h3>
      {field.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {field.description}
        </p>
      )}
    </div>
  );
}