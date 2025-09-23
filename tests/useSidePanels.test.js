import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSidePanels } from '../src/components/useSidePanels.js';

const baseProps = {
  isCompact: true,
  hasLeftPanel: true,
  hasRightPanel: true,
  hideMenuToggle: false,
  hideProfileToggle: false,
  forceMenuButton: false,
  forceProfileButton: false,
};

describe('useSidePanels', () => {
  it('toggles panels and closes opposing panel on compact layouts', () => {
    const { result } = renderHook((props) => useSidePanels(props), {
      initialProps: baseProps,
    });

    act(() => {
      result.current.toggleLeft();
    });

    expect(result.current.leftOpen).toBe(true);
    expect(result.current.rightOpen).toBe(false);

    act(() => {
      result.current.toggleRight();
    });

    expect(result.current.rightOpen).toBe(true);
    expect(result.current.leftOpen).toBe(false);

    act(() => {
      result.current.closeRight();
    });

    expect(result.current.rightOpen).toBe(false);
  });

  it('exposes toggle buttons when forced even without panels', () => {
    const { result } = renderHook((props) => useSidePanels(props), {
      initialProps: {
        ...baseProps,
        hasLeftPanel: false,
        hasRightPanel: false,
        forceMenuButton: true,
        forceProfileButton: true,
      },
    });

    expect(result.current.menuToggleEnabled).toBe(true);
    expect(result.current.profileToggleEnabled).toBe(true);

    act(() => {
      result.current.toggleLeft();
      result.current.toggleRight();
    });

    expect(result.current.leftOpen).toBe(false);
    expect(result.current.rightOpen).toBe(false);
  });
});
