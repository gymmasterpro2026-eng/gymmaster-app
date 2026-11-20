import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return `1 MÚSCULO`;
    if (selected.length === options.length) return 'TODOS LOS MÚSCULOS';
    return `${selected.length} MÚSCULOS`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', minWidth: '160px' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="titan-select"
        style={{
          width: '100%',
          color: selected.length > 0 ? '#FFBD4A' : '#CBD5E1',
          fontSize: '11px',
          fontFamily: "'Chakra Petch', sans-serif",
          fontWeight: 700,
          padding: '8px 10px',
          borderColor: isOpen ? '#D57A30' : undefined,
          textTransform: 'uppercase',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{getDisplayText()}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div className="titan-armor-card" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '215px',
          maxHeight: '250px',
          overflowY: 'auto',
          borderColor: 'rgba(213, 122, 48, 0.55)',
          marginTop: '4px',
          zIndex: 80,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {options.map((option) => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              style={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                background: selected.includes(option) ? 'rgba(213, 122, 48, 0.14)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div style={{
                width: '14px',
                height: '14px',
                border: selected.includes(option) ? '1px solid #D57A30' : '1px solid #64748b',
                background: selected.includes(option) ? '#D57A30' : 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selected.includes(option) && <Check size={10} color="#090C11" strokeWidth={4} />}
              </div>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: selected.includes(option) ? '#FFBD4A' : '#cbd5e1',
                textTransform: 'uppercase'
              }}>
                {option}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
