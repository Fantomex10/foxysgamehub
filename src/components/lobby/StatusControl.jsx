import { useEffect, useRef, useState } from 'react';
import { useLobbyTokens, colorWithOpacity, resolveStatusColor, resolveStatusSoftColor } from './utils.js';

const STATIC_CONTROL_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 6px',
  borderRadius: '999px',
  minWidth: '32px',
  height: '28px',
  gap: '4px',
};

const STATUS_LABELS = {
  notReady: 'Not ready',
  ready: 'Ready',
  needsTime: 'Needs time',
};

const STATUS_OPTIONS = ['notReady', 'ready', 'needsTime'];

const NotReadyIcon = ({ color, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="2" />
    <line x1="5" y1="9" x2="13" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ReadyIcon = ({ color, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="2" />
    <polyline points="4.5,9.5 7.5,12.5 13.5,6.5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NeedsTimeIcon = ({ color, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="2" />
    <line x1="9" y1="9" x2="9" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="9" y1="9" x2="12" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ICON_LOOKUP = {
  notReady: NotReadyIcon,
  ready: ReadyIcon,
  needsTime: NeedsTimeIcon,
};

const ChevronDownIcon = ({ color, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 4.5L6 7.5L9 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const dropdownWrapperStyle = {
  position: 'relative',
  marginLeft: 'auto',
  display: 'inline-flex',
};

const dropdownMenuStyle = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: '160px',
  padding: '6px 0',
  borderRadius: '10px',
  zIndex: 50,
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 14px',
  width: '100%',
  border: 'none',
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'left',
  background: 'transparent',
};

const StatusIcon = ({ status, size = 18, color }) => {
  const IconComponent = ICON_LOOKUP[status] ?? NotReadyIcon;
  return <IconComponent color={color} size={size} />;
};

const StatusControl = ({ status, interactive, onSelect, onCycle, playerName }) => {
  const { theme, scaleFont } = useLobbyTokens();
  const currentLabel = STATUS_LABELS[status] ?? STATUS_LABELS.notReady;
  const statusColor = resolveStatusColor(status, theme);
  const statusSoftColor = resolveStatusSoftColor(status, theme);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!onSelect || !open) {
      return undefined;
    }

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
  }, [onSelect, open]);

  if (!interactive) {
    return (
      <div style={dropdownWrapperStyle}>
        <div
          style={{
            ...STATIC_CONTROL_STYLE,
            border: `1px solid ${colorWithOpacity(statusColor, 0.33)}`,
            background: theme.colors.surfaceMuted,
            color: statusColor,
            cursor: 'default',
          }}
          aria-label={`Status for ${playerName ?? 'player'}: ${currentLabel}`}
          title={currentLabel}
        >
          <StatusIcon status={status} color={statusColor} size={14} />
        </div>
      </div>
    );
  }

  if (!onSelect) {
    return (
      <div style={dropdownWrapperStyle}>
        <button
          type="button"
          onClick={onCycle}
          style={{
            ...STATIC_CONTROL_STYLE,
            border: `1px solid ${colorWithOpacity(statusColor, 0.44)}`,
            background: theme.colors.surfaceMuted,
            color: statusColor,
            cursor: 'pointer',
          }}
          aria-label={`Toggle status for ${playerName ?? 'player'} (currently ${currentLabel})`}
          title={`Toggle status (currently ${currentLabel})`}
        >
          <StatusIcon status={status} color={statusColor} size={14} />
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
    <div style={dropdownWrapperStyle}>
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          ...STATIC_CONTROL_STYLE,
          border: `1px solid ${colorWithOpacity(statusColor, open ? 0.67 : 0.44)}`,
          background: open ? statusSoftColor : theme.colors.surfaceMuted,
          color: statusColor,
          cursor: 'pointer',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change status for ${playerName ?? 'player'} (currently ${currentLabel})`}
        title={`Change status (currently ${currentLabel})`}
      >
        <StatusIcon status={status} color={statusColor} size={14} />
        <ChevronDownIcon color={statusColor} size={11} />
      </button>
      {open && (
        <div
          ref={menuRef}
          style={{
            ...dropdownMenuStyle,
            background: theme.colors.surfaceElevated ?? theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.panel,
          }}
          role="listbox"
          aria-label={`Select a status for ${playerName ?? 'player'}`}
        >
          {STATUS_OPTIONS.map((option) => {
            const isActive = option === status;
            const optionColor = resolveStatusColor(option, theme);
            const optionSoft = resolveStatusSoftColor(option, theme);
            const optionLabel = STATUS_LABELS[option] ?? STATUS_LABELS.notReady;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                style={{
                  ...dropdownItemStyle,
                  background: isActive ? optionSoft : theme.colors.surfaceMuted,
                  color: optionColor,
                  fontSize: scaleFont('13px'),
                  fontWeight: isActive ? 600 : 500,
                }}
                role="option"
                aria-selected={isActive}
              >
                <StatusIcon status={option} color={optionColor} size={14} />
                <span style={{ color: theme.colors.textPrimary }}>{optionLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusControl;
