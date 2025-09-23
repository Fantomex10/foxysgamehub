import React from 'react';

export const OptionSection = ({
  title,
  items,
  renderDescription,
  isActive,
  onSelect,
  onUnlock,
  optionButtonStyle,
  unlockButtonStyle,
  sectionHeaderStyle,
  optionGridStyle,
  scaleFont,
  theme,
}) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
    <h3 style={sectionHeaderStyle}>{title}</h3>
    <div style={optionGridStyle}>
      {items.map((item) => {
        const active = isActive(item);
        const locked = Boolean(item.locked);
        const description = renderDescription ? renderDescription(item) : item.description;
        const priceLabel = item.entitlement?.price
          ? `${item.entitlement.price} ${item.entitlement.currency ?? 'chips'}`
          : null;
        const unlockHints = priceLabel
          || (item.requiredUnlocks?.length ? `${item.requiredUnlocks.length} required` : null);
        const showUnlockButton = Boolean(onUnlock && locked);
        const unlockLabel = item.unlockLabel ?? 'Unlock';

        return (
          <div
            key={item.id}
            style={{ display: 'flex', flexDirection: 'column', gap: showUnlockButton ? '6px' : '0' }}
          >
            <button
              type="button"
              onClick={() => onSelect(item)}
              style={optionButtonStyle({ active, locked })}
              aria-pressed={active}
              data-active={active}
              disabled={locked}
            >
              <strong style={{ fontSize: scaleFont('14px') }}>{item.name}</strong>
              {description && (
                <span style={{ fontSize: scaleFont('12px'), color: theme.colors.textSecondary }}>
                  {description}
                </span>
              )}
              {locked && (
                <span style={{ fontSize: scaleFont('11px'), color: theme.colors.accentWarning }}>
                  Locked{unlockHints ? ` • ${unlockHints}` : ''}
                </span>
              )}
            </button>
            {showUnlockButton && (
              <button
                type="button"
                onClick={() => onUnlock(item)}
                style={unlockButtonStyle}
              >
                {unlockLabel}
              </button>
            )}
          </div>
        );
      })}
    </div>
  </section>
);

export default OptionSection;
