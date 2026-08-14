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
        style={{
          width: '100%',
          background: '#0f172a',
          color: selected.length > 0 ? '#f59e0b' : '#94a3b8',
          fontSize: '11px',
          fontWeight: 800,
          padding: '8px 10px',
          border: isOpen ? '1px solid #f59e0b' : '1px solid #334155',
          outline: 'none',
          textTransform: 'uppercase',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '4px',
          transition: 'all 0.2s ease'
        }}
      >
        <span>{getDisplayText()}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '200px',
          maxHeight: '250px',
          overflowY: 'auto',
          background: '#0f172a',
          border: '1px solid rgba(245, 158, 11, 0.5)',
          borderRadius: '4px',
          marginTop: '4px',
          zIndex: 50,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
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
                background: selected.includes(option) ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                borderBottom: '1px solid #1e293b'
              }}
            >
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                border: selected.includes(option) ? '1px solid #f59e0b' : '1px solid #64748b',
                background: selected.includes(option) ? '#f59e0b' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selected.includes(option) && <Check size={10} color="#000" strokeWidth={4} />}
              </div>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: selected.includes(option) ? '#f59e0b' : '#cbd5e1',
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
