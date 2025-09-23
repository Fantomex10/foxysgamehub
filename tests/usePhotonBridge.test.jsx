import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePhotonBridge } from '../src/app/hooks/usePhotonBridge.js';

const mockState = { phase: 'idle' };

vi.mock('../src/hooks/usePhotonRoomState.js', () => ({
  usePhotonRoomState: vi.fn((photon, engine, authUser, options) => {
    options?.onProfileError?.();
    return { state: mockState, profileLoaded: true };
  }),
}));

describe('usePhotonBridge', () => {
  it('returns photon state and marks session offline on profile errors', () => {
    const photon = {};
    const engine = { id: 'test-engine' };
    const authUser = { uid: 'user-1' };
    const setProfileBlocked = vi.fn();
    const setAuthUser = vi.fn();

    const { result } = renderHook(() => usePhotonBridge({
      photon,
      engine,
      authUser,
      profileBlocked: false,
      setProfileBlocked,
      setAuthUser,
    }));

    expect(result.current.state).toBe(mockState);
    expect(result.current.profileLoaded).toBe(true);
    expect(setProfileBlocked).toHaveBeenCalledWith(true);
    expect(setAuthUser).toHaveBeenCalled();
    const updateFn = setAuthUser.mock.calls[0][0];
    expect(typeof updateFn).toBe('function');
  });
});
