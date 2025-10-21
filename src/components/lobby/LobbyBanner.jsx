import { useEffect, useState } from "react";
import { useCustomizationTokens } from "../../customization/useCustomization.js";
import { scaleFont } from "../../ui/typography.js";

export const LobbyBanner = ({ banner }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (banner) {
      setDismissed(false);
    }
  }, [banner]);

  if (!banner || dismissed) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: theme.spacing.lg,
        right: theme.spacing.md,
        left: theme.spacing.md,
        background: theme.colors.accentDanger,
        border: `1px solid ${theme.colors.accentDanger}`,
        color: theme.colors.surface,
        padding: `${scaleFont("10px", fontScale)} ${scaleFont("14px", fontScale)}`,
        borderRadius: theme.radii.sm,
        fontSize: scaleFont("14px", fontScale),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.spacing.sm,
        boxShadow: theme.shadows.panel,
        zIndex: 10,
      }}
      role="status"
      aria-live="assertive"
    >
      <span style={{ flex: "1 1 auto" }}>{banner}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        style={{
          border: `1px solid ${theme.colors.surface}`,
          background: theme.colors.surface,
          color: theme.colors.accentDanger,
          borderRadius: theme.radii.xs,
          padding: `${scaleFont("4px", fontScale)} ${scaleFont("10px", fontScale)}`,
          cursor: "pointer",
          fontSize: scaleFont("12px", fontScale),
          fontWeight: 600,
        }}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};
