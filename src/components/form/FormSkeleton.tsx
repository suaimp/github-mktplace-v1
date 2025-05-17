import React from 'react';

export default function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Form Title */}
      <div className="h-8 bg-gray-200 rounded-lg w-1/3 dark:bg-gray-800"></div>
      
      {/* Form Description */}
      <div className="h-4 bg-gray-200 rounded w-2/3 dark:bg-gray-800"></div>
      
      {/* Form Fields */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4 dark:bg-gray-800"></div>
            <div className="h-11 bg-gray-200 rounded-lg dark:bg-gray-800"></div>
          </div>
        ))}
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <div className="h-10 bg-gray-200 rounded-lg w-24 dark:bg-gray-800"></div>
      </div>
    </div>
  );
}