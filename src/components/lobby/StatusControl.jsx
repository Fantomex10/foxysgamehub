import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

const hexWithAlpha = (hex, alpha = '66') => {
  if (typeof hex !== 'string' || !hex.startsWith('#')) return hex;
  if (hex.length === 9) return hex;
  if (hex.length === 4) {
    const expanded = hex
      .slice(1)
      .split('')
      .map((char) => char + char)
      .join('');
    return `#${expanded}${alpha}`;
  }
  if (hex.length === 7) return `${hex}${alpha}`;
  return hex;
};

const STATUS_OPTIONS = ['notReady', 'ready', 'needsTime'];

const STATUS_LABELS = {
  notReady: 'Not ready',
  ready: 'Ready',
  needsTime: 'Needs time',
};

const resolveStatusColor = (theme, status) => {
  switch (status) {
    case 'ready':
      return theme.colors.accentSuccess;
    case 'needsTime':
      return theme.colors.accentDanger;
    case 'notReady':
    default:
      return theme.colors.accentWarning;
  }
};

const StatusIconCircle = ({ color, children, size }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="2" />
    {children}
  </svg>
);

const ICON_RENDERERS = {
  notReady: (color, size = 18) => (
    <StatusIconCircle color={color} size={size}>
      <line x1="5" y1="9" x2="13" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </StatusIconCircle>
  ),
  ready: (color, size = 18) => (
    <StatusIconCircle color={color} size={size}>
      <polyline
        points="4.5,9.5 7.5,12.5 13.5,6.5"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </StatusIconCircle>
  ),
  needsTime: (color, size = 18) => (
    <StatusIconCircle color={color} size={size}>
      <line x1="9" y1="9" x2="9" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="9" x2="12" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </StatusIconCircle>
  ),
};

const ChevronDownIcon = ({ color, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 4.5L6 7.5L9 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StatusControl = ({ status, interactive, onSelect, onCycle, playerName }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = accessibility?.prefersReducedMotion ?? false;
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const color = resolveStatusColor(theme, status);
  const label = STATUS_LABELS[status] ?? STATUS_LABELS.notReady;
  const iconSize = scaleFont(14, fontScale) || 14;
  const chevronSize = scaleFont(11, fontScale) || 11;

  const wrapperStyle = useMemo(() => ({
    position: 'relative',
    marginLeft: 'auto',
    display: 'inline-flex',
  }), []);

  const controlBase = useMemo(() => {
    const verticalPadding = scaleFont('4px', fontScale);
    const horizontalPadding = scaleFont('6px', fontScale);
    const height = scaleFont('28px', fontScale);
    const minWidth = scaleFont('32px', fontScale);
    const gap = scaleFont('4px', fontScale);
    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${verticalPadding} ${horizontalPadding}`,
      borderRadius: '999px',
      minWidth,
      height,
      gap,
      transition: prefersReducedMotion ? 'none' : 'background 0.2s ease, border 0.2s ease',
    };
  }, [fontScale, prefersReducedMotion]);

  const dropdownStyle = useMemo(() => {
    const dropdownPadding = scaleFont('6px', fontScale);
    const dropdownGap = scaleFont('2px', fontScale);
    const dropdownMinWidth = scaleFont('160px', fontScale);
    return {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      right: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: dropdownGap,
      minWidth: dropdownMinWidth,
      padding: `${dropdownPadding} 0`,
      background: theme.colors.surfaceElevated ?? theme.colors.surface,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.radii.sm,
      boxShadow: theme.shadows.panel,
      zIndex: 50,
      transition: prefersReducedMotion ? 'none' : 'opacity 0.2s ease',
    };
  }, [theme, fontScale, prefersReducedMotion]);

  const optionFontSize = scaleFont('13px', fontScale);
  const optionGap = scaleFont('8px', fontScale);
  const optionPaddingY = scaleFont('8px', fontScale);
  const optionPaddingX = scaleFont('14px', fontScale);

  useEffect(() => {
    if (!open) return () => {};

    const handlePointer = (event) => {
      if (!menuRef.current || !buttonRef.current) return;
      if (menuRef.current.contains(event.target) || buttonRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!interactive) {
    return (
      <div style={wrapperStyle}>
        <div
          style={{
            ...controlBase,
            border: `1px solid ${hexWithAlpha(color, '55')}`,
            background: theme.colors.surfaceMuted,
            color,
            cursor: 'default',
          }}
          aria-label={`Status for ${playerName ?? 'player'}: ${label}`}
          title={label}
        >
          {(ICON_RENDERERS[status] ?? ICON_RENDERERS.notReady)(color, iconSize)}
        </div>
      </div>
    );
  }

  if (!onSelect) {
    return (
      <div style={wrapperStyle}>
        <button
          type="button"
          onClick={onCycle}
          style={{
            ...controlBase,
            border: `1px solid ${hexWithAlpha(color, '70')}`,
            background: theme.colors.surfaceMuted,
            color,
            cursor: 'pointer',
          }}
          aria-label={`Toggle status for ${playerName ?? 'player'} (currently ${label})`}
          title={`Toggle status (currently ${label})`}
        >
          {(ICON_RENDERERS[status] ?? ICON_RENDERERS.notReady)(color, iconSize)}
        </button>
      </div>
    );
  }

  const handleSelect = (value) => {
    setOpen(false);
    if (value && value !== status) {
      onSelect(value);
    }
  };

  return (
    <div style={wrapperStyle}>
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          ...controlBase,
          border: `1px solid ${hexWithAlpha(color, open ? 'AA' : '70')}`,
          background: open ? theme.colors.surfaceAlt : theme.colors.surfaceMuted,
          color,
          cursor: 'pointer',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change status for ${playerName ?? 'player'} (currently ${label})`}
        title={`Change status (currently ${label})`}
      >
        {(ICON_RENDERERS[status] ?? ICON_RENDERERS.notReady)(color, iconSize)}
        <ChevronDownIcon color={color} size={chevronSize} />
      </button>
      {open && (
        <div
          ref={menuRef}
          style={dropdownStyle}
          role="listbox"
          aria-label={`Select a status for ${playerName ?? 'player'}`}
        >
          {STATUS_OPTIONS.map((option) => {
            const optionColor = resolveStatusColor(theme, option);
            const optionLabel = STATUS_LABELS[option] ?? STATUS_LABELS.notReady;
            const isActive = option === status;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: optionGap,
                  padding: `${optionPaddingY} ${optionPaddingX}`,
                  width: '100%',
                  border: 'none',
                  background: isActive ? theme.colors.surfaceMuted : 'transparent',
                  color: theme.colors.textPrimary,
                  fontSize: optionFontSize,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                role="option"
                aria-selected={isActive}
              >
                {(ICON_RENDERERS[option] ?? ICON_RENDERERS.notReady)(optionColor, iconSize)}
                <span>{optionLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
