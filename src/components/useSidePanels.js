import { useCallback, useEffect, useState } from 'react';

export const useSidePanels = ({
  isCompact,
  hasLeftPanel,
  hasRightPanel,
  hideMenuToggle,
  hideProfileToggle,
  forceMenuButton,
  forceProfileButton,
}) => {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const menuToggleEnabled = Boolean(forceMenuButton || (!hideMenuToggle && hasLeftPanel));
  const profileToggleEnabled = Boolean(forceProfileButton || (!hideProfileToggle && hasRightPanel));

  useEffect(() => {
    if (isCompact) {
      setLeftOpen(false);
      setRightOpen(false);
    }
  }, [isCompact]);

  useEffect(() => {
    if (!menuToggleEnabled && leftOpen) {
      setLeftOpen(false);
    }
  }, [menuToggleEnabled, leftOpen]);

  useEffect(() => {
    if (!profileToggleEnabled && rightOpen) {
      setRightOpen(false);
    }
  }, [profileToggleEnabled, rightOpen]);

  useEffect(() => {
    if (!hasLeftPanel && leftOpen) {
      setLeftOpen(false);
    }
  }, [hasLeftPanel, leftOpen]);

  useEffect(() => {
    if (!hasRightPanel && rightOpen) {
      setRightOpen(false);
    }
  }, [hasRightPanel, rightOpen]);

  const closeLeft = useCallback(() => {
    setLeftOpen(false);
  }, []);

  const closeRight = useCallback(() => {
    setRightOpen(false);
  }, []);

  const toggleLeft = useCallback(() => {
    if (!menuToggleEnabled || !hasLeftPanel) return;
    setLeftOpen((previous) => {
      if (!previous && isCompact) {
        setRightOpen(false);
      }
      return !previous;
    });
  }, [menuToggleEnabled, hasLeftPanel, isCompact]);

  const toggleRight = useCallback(() => {
    if (!profileToggleEnabled || !hasRightPanel) return;
    setRightOpen((previous) => {
      if (!previous && isCompact) {
        setLeftOpen(false);
      }
      return !previous;
    });
  }, [profileToggleEnabled, hasRightPanel, isCompact]);

  return {
    leftOpen,
    rightOpen,
    toggleLeft,
    toggleRight,
    menuToggleEnabled,
    profileToggleEnabled,
    closeLeft,
    closeRight,
  };
};
