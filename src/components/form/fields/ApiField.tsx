import Input from '../input/InputField';
import { useState, useEffect } from 'react';

interface ApiFieldProps {
  field: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

// Function to format number with commas
const formatNumber = (value: string, maxValue?: number): string => {
  if (!value) return '';
  
  // Remove any non-digits
  const number = value.replace(/\D/g, '');
  
  // Convert to number and limit to max value if specified
  let limitedNumber = parseInt(number);
  if (!isNaN(limitedNumber) && maxValue !== undefined) {
    limitedNumber = Math.min(limitedNumber, maxValue);
  }
  
  // Convert back to string and add commas
  return limitedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Function to get score letter based on value
const getScoreInfo = (value: number): { letter: string, bgColor: string, textColor: string, hoverBgColor: string, hoverTextColor: string } => {
  if (value >= 80) {
    return {
      letter: 'A',
      bgColor: '#9EF2C9',
      textColor: '#007C65',
      hoverBgColor: '#00C192',
      hoverTextColor: '#fff'
    };
  } else if (value >= 60) {
    return {
      letter: 'B',
      bgColor: '#C4E5FE',
      textColor: '#006DCA',
      hoverBgColor: '#2BB3FF',
      hoverTextColor: '#fff'
    };
  } else if (value >= 40) {
    return {
      letter: 'C',
      bgColor: '#EDD9FF',
      textColor: '#8649E1',
      hoverBgColor: '#AB6CFE',
      hoverTextColor: '#fff'
    };
  } else if (value >= 20) {
    return {
      letter: 'D',
      bgColor: '#FCE081',
      textColor: '#A75800',
      hoverBgColor: '#EF9800',
      hoverTextColor: '#fff'
    };
  } else {
    return {
      letter: 'F',
      bgColor: '#f9b4b4',
      textColor: '#b84f53',
      hoverBgColor: '#ff4953',
      hoverTextColor: '#fff'
    };
  }
};

export default function ApiField({
  field,
  value,
  onChange,
  error,
  onErrorClear
}: ApiFieldProps) {
  // Determine if this field should be limited to 0-100
  const shouldLimit100 = ['moz_da', 'semrush_as', 'ahrefs_dr'].includes(field.field_type);
  
  // State for score display
  const [showScore, setShowScore] = useState(false);
  const [scoreInfo, setScoreInfo] = useState<ReturnType<typeof getScoreInfo> | null>(null);
  
  // Update score info when value changes
  useEffect(() => {
    if (shouldLimit100 && value) {
      const numValue = parseInt(value.replace(/,/g, ''));
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        setScoreInfo(getScoreInfo(numValue));
        setShowScore(true);
      } else {
        setShowScore(false);
      }
    } else {
      setShowScore(false);
    }
  }, [value, shouldLimit100]);
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value ? formatNumber(value, shouldLimit100 ? 100 : undefined) : ''}
          onChange={(e) => {
            const formattedValue = formatNumber(e.target.value, shouldLimit100 ? 100 : undefined);
            onChange(formattedValue);
            if (error && onErrorClear) {
              onErrorClear();
            }
          }}
          placeholder="0"
          error={!!error}
          hint={error}
          className="flex-1"
        />
        
        {showScore && scoreInfo && (
          <div 
            className="flex items-center justify-center w-5 h-5 rounded-sm text-xs font-bold transition-colors hover:scale-110"
            style={{ 
              backgroundColor: scoreInfo.bgColor, 
              color: scoreInfo.textColor,
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = scoreInfo.hoverBgColor;
              e.currentTarget.style.color = scoreInfo.hoverTextColor;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = scoreInfo.bgColor;
              e.currentTarget.style.color = scoreInfo.textColor;
            }}
            title={`Score ${scoreInfo.letter}`}
          >
            {scoreInfo.letter}
          </div>
        )}
      </div>
    </div>
  );
}