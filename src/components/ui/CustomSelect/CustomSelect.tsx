/**
 * CustomSelect Component
 *
 * Custom styled dropdown that replaces native <select> elements.
 * Keyboard navigable, ARIA accessible, animated.
 *
 * @module components/ui/CustomSelect
 */

'use client';

import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps {
  options: CustomSelectOption[];
  value?: string;
  onChange?: (_value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  id?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className,
  label,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const opt = options[highlightedIndex];
            if (!opt.disabled) {
              onChange?.(opt.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(true);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => {
              let next = prev + 1;
              while (next < options.length && options[next].disabled) next++;
              return next < options.length ? next : prev;
            });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && options[next].disabled) next--;
            return next >= 0 ? next : prev;
          });
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    },
    [disabled, isOpen, highlightedIndex, options, onChange]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          className="mb-1.5 block text-sm font-medium text-foreground"
          htmlFor={id}
        >
          {label}
        </label>
      )}

      {/* Native Select (optional, for mobile/no-clipping) */}
      <select
        className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0"
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
          setIsOpen(false);
        }}
        disabled={disabled}
        aria-label={label || placeholder}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Trigger (Visual) */}
      <div
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm',
          'transition-colors',
          !disabled && 'hover:bg-muted/50',
          disabled && 'cursor-not-allowed opacity-50',
          isOpen && 'ring-2 ring-ring ring-offset-2'
        )}
      >
        <span
          className={cn(
            'flex items-center gap-2 truncate',
            !selectedOption && 'text-muted-foreground'
          )}
        >
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </div>

      {/* Options panel (Hidden if using functionality via native select predominantly,
          but usually we want native ONLY on mobile.
          For this quick fix, we overlay native select ALWAYS if the user acts on it?
          Actually, if native select is present and covering, the custom dropdown logic won't trigger
          because click hits select.
          So we don't render the Custom dropdown if we want native behavior.
          The user issue was clipping. Native select solves clipping.
          So we might just rely on native select.
      */}
    </div>
  );
}

CustomSelect.displayName = 'CustomSelect';
