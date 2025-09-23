import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defaultThemeId, getThemeById } from '../ui/theme.js';
import {
  getCardSkinById,
  listCardSkins,
  getDefaultCardSkinId,
} from './skins/cards.js';
import {
  getTableSkinById,
  listTableSkins,
  getDefaultTableSkinId,
} from './skins/table.js';
import {
  getPieceSkinById,
  listPieceSkins,
  getDefaultPieceSkinId,
} from './skins/pieces.js';
import {
  getBackdropById,
  listBackdrops,
  getDefaultBackdropId,
} from './backdrops.js';
import {
  getPresetById,
  listPresets,
  getDefaultPresetId,
} from './presets.js';
import { readStoredCustomization, writeStoredCustomization } from './storage.js';
import { useTheme } from '../ui/ThemeContext.jsx';

const defaultAccessibility = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
};

const defaultSyncState = {
  status: 'idle',
  error: null,
};

const sanitiseUnlockArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set();
  const results = [];
  for (const id of value) {
    if (typeof id !== 'string' || id.length === 0) {
      continue;
    }
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    results.push(id);
  }
  return results;
};

export const ensureAccessibility = (value = {}) => ({
  highContrast: Boolean(value.highContrast),
  reducedMotion: Boolean(value.reducedMotion),
  largeText: Boolean(value.largeText),
});

const areStatesEqual = (a, b) => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  const left = a.accessibility ?? defaultAccessibility;
  const right = b.accessibility ?? defaultAccessibility;
  return a.themeId === b.themeId
    && a.presetId === b.presetId
    && a.cardSkinId === b.cardSkinId
    && a.tableSkinId === b.tableSkinId
    && a.pieceSkinId === b.pieceSkinId
    && a.backdropId === b.backdropId
    && Boolean(left.highContrast) === Boolean(right.highContrast)
    && Boolean(left.reducedMotion) === Boolean(right.reducedMotion)
    && Boolean(left.largeText) === Boolean(right.largeText);
};

const resolveOverrideValue = (overrides, key) => (
  overrides && typeof overrides[key] === 'string' && overrides[key].length > 0
    ? overrides[key]
    : undefined
);

export const createSuggestedState = (themeId, overrides = {}) => {
  let effectiveThemeId = resolveOverrideValue(overrides, 'themeId') ?? themeId ?? defaultThemeId;
  let theme = getThemeById(effectiveThemeId);
  let suggestions = theme.customization ?? {};

  const presetOverrideId = resolveOverrideValue(overrides, 'presetId') ?? suggestions.suggestedPresetId ?? null;
  const preset = presetOverrideId ? getPresetById(presetOverrideId) : null;

  if (preset?.themeId && preset.themeId !== theme.id) {
    theme = getThemeById(preset.themeId);
    suggestions = theme.customization ?? {};
  }

  const resolvedPresetId = preset?.id ?? presetOverrideId;

  const cardSkinId = resolveOverrideValue(overrides, 'cardSkinId')
    ?? preset?.cardSkinId
    ?? suggestions.suggestedCardSkinId
    ?? null;
  const tableSkinId = resolveOverrideValue(overrides, 'tableSkinId')
    ?? preset?.tableSkinId
    ?? suggestions.suggestedTableSkinId
    ?? null;
  const pieceSkinId = resolveOverrideValue(overrides, 'pieceSkinId')
    ?? preset?.pieceSkinId
    ?? suggestions.suggestedPieceSkinId
    ?? null;
  const backdropId = resolveOverrideValue(overrides, 'backdropId')
    ?? preset?.backdropId
    ?? suggestions.suggestedBackdropId
    ?? null;

  const accessibility = ensureAccessibility({
    ...defaultAccessibility,
    ...(suggestions.accessibility ?? {}),
    ...(preset?.accessibility ?? {}),
    ...(overrides.accessibility ?? {}),
  });

  return {
    themeId: theme.id,
    presetId: resolvedPresetId,
    cardSkinId,
    tableSkinId,
    pieceSkinId,
    backdropId,
    accessibility,
  };
};

export const sanitiseState = (input = {}, fallbackThemeId) => {
  const theme = getThemeById(input.themeId ?? fallbackThemeId ?? defaultThemeId);
  const themeId = theme.id;
  const cardSkinId = getCardSkinById(input.cardSkinId)?.id ?? getDefaultCardSkinId();
  const tableSkinId = getTableSkinById(input.tableSkinId)?.id ?? getDefaultTableSkinId();
  const pieceSkinId = getPieceSkinById(input.pieceSkinId)?.id ?? getDefaultPieceSkinId();
  const backdropId = getBackdropById(input.backdropId)?.id ?? getDefaultBackdropId();

  const preset = input.presetId ? getPresetById(input.presetId) : null;
  const presetId = preset && (!preset.themeId || preset.themeId === themeId) ? preset.id : null;

  return {
    themeId,
    presetId,
    cardSkinId,
    tableSkinId,
    pieceSkinId,
    backdropId,
    accessibility: ensureAccessibility(input.accessibility ?? defaultAccessibility),
  };
};

const normaliseStoredState = (payload, fallbackThemeId) => {
  if (!payload?.state) {
    return {
      state: sanitiseState(createSuggestedState(fallbackThemeId), fallbackThemeId),
      updatedAt: null,
      unlocks: [],
    };
  }
  return {
    state: sanitiseState(payload.state, fallbackThemeId),
    updatedAt: typeof payload.updatedAt === 'number' ? payload.updatedAt : null,
    unlocks: sanitiseUnlockArray(payload.unlocks),
  };
};

const createLookup = (items) => {
  const map = new Map();
  items.forEach((item) => {
    map.set(item.id, item);
  });
  return map;
};

export const useCustomizationStateMachine = () => {
  const {
    themeId: activeThemeId,
    setThemeId: setThemeFromContext,
  } = useTheme();

  const storedPayload = useMemo(() => readStoredCustomization(), []);

  const baseThemeId = activeThemeId ?? defaultThemeId;

  const initial = useMemo(
    () => normaliseStoredState(storedPayload, baseThemeId),
    [storedPayload, baseThemeId],
  );

  const [state, setState] = useState(initial.state);
  const [syncState, setSyncState] = useState(defaultSyncState);
  const [updatedAt, setUpdatedAt] = useState(initial.updatedAt);
  const [unlocks, setUnlocks] = useState(initial.unlocks ?? []);

  const unlockSet = useMemo(() => new Set(unlocks), [unlocks]);
  const engineDefaultsRef = useRef({ engineId: null, defaults: null });

  const catalog = useMemo(() => {
    const cardSkins = listCardSkins();
    const tableSkins = listTableSkins();
    const pieceSkins = listPieceSkins();
    const backdrops = listBackdrops();
    const presets = listPresets();

    return {
      cardSkins,
      tableSkins,
      pieceSkins,
      backdrops,
      presets,
      lookups: {
        cardSkins: createLookup(cardSkins),
        tableSkins: createLookup(tableSkins),
        pieceSkins: createLookup(pieceSkins),
        backdrops: createLookup(backdrops),
        presets: createLookup(presets),
      },
    };
  }, []);

  const pendingMetadataRef = useRef(null);
  const unlocksDirtyRef = useRef(false);

  const applyState = useCallback((updater, options = {}) => {
    setState((current) => {
      const candidate = typeof updater === 'function'
        ? updater(current)
        : { ...current, ...updater };

      if (candidate === current) {
        pendingMetadataRef.current = null;
        return current;
      }

      const next = sanitiseState(candidate, candidate.themeId ?? current.themeId);
      const resolvedUpdatedAt = typeof options.updatedAt === 'number' ? options.updatedAt : Date.now();
      pendingMetadataRef.current = {
        updatedAt: resolvedUpdatedAt,
        source: options.source ?? 'local',
      };

      return next;
    });
  }, []);

  const ensureUnlockedSelections = useCallback((currentState, unlockMap, provisionalUnlocks = []) => {
    const provisionalSet = new Set(provisionalUnlocks);

    const isUnlocked = (entry) => {
      const entitlementId = entry?.entitlement?.id;
      if (!entitlementId) {
        return true;
      }
      return unlockMap.has(entitlementId) || provisionalSet.has(entitlementId);
    };

    let nextState = currentState;

    const ensure = (key, fallbackId, lookup) => {
      const entry = lookup.get(nextState[key]);
      if (entry && !isUnlocked(entry)) {
        if (nextState === currentState) {
          nextState = { ...currentState, presetId: null };
        } else {
          nextState.presetId = null;
        }
        nextState[key] = fallbackId;
      }
    };

    ensure('cardSkinId', getDefaultCardSkinId(), catalog.lookups.cardSkins);
    ensure('tableSkinId', getDefaultTableSkinId(), catalog.lookups.tableSkins);
    ensure('pieceSkinId', getDefaultPieceSkinId(), catalog.lookups.pieceSkins);
    ensure('backdropId', getDefaultBackdropId(), catalog.lookups.backdrops);

    return nextState;
  }, [catalog.lookups]);

  useEffect(() => {
    setState((current) => ensureUnlockedSelections(current, unlockSet));
  }, [ensureUnlockedSelections, unlockSet]);

  useEffect(() => {
    const metadata = pendingMetadataRef.current;
    let nextUpdatedAt = updatedAt;
    if (metadata) {
      nextUpdatedAt = metadata.updatedAt ?? Date.now();
      pendingMetadataRef.current = null;
    } else if (unlocksDirtyRef.current) {
      nextUpdatedAt = Date.now();
      unlocksDirtyRef.current = false;
    } else if (!nextUpdatedAt) {
      nextUpdatedAt = Date.now();
    }

    if (nextUpdatedAt !== updatedAt) {
      setUpdatedAt(nextUpdatedAt);
    }

    writeStoredCustomization(state, nextUpdatedAt, unlocks);
  }, [state, unlocks, updatedAt]);

  useEffect(() => {
    if (!activeThemeId) {
      return;
    }
    applyState((current) => {
      if (current.themeId === activeThemeId) {
        return current;
      }
      return { ...current, themeId: activeThemeId };
    }, { source: 'theme-sync' });
  }, [activeThemeId, applyState]);

  const decorateItem = useCallback((item) => {
    const unlockId = item.entitlement?.id ?? null;
    const locked = Boolean(unlockId) && !unlockSet.has(unlockId);
    return {
      ...item,
      unlockId,
      locked,
    };
  }, [unlockSet]);

  const availableOptions = useMemo(() => {
    const decoratedCardSkins = catalog.cardSkins.map(decorateItem);
    const decoratedTableSkins = catalog.tableSkins.map(decorateItem);
    const decoratedPieceSkins = catalog.pieceSkins.map(decorateItem);
    const decoratedBackdrops = catalog.backdrops.map(decorateItem);

    const computePresetLock = (preset) => {
      const unlockIds = [];
      const collect = (entry) => {
        if (entry?.entitlement?.id) {
          unlockIds.push(entry.entitlement.id);
        }
      };
      collect(catalog.lookups.cardSkins.get(preset.cardSkinId));
      collect(catalog.lookups.tableSkins.get(preset.tableSkinId));
      collect(catalog.lookups.pieceSkins.get(preset.pieceSkinId));
      collect(catalog.lookups.backdrops.get(preset.backdropId));
      const locked = unlockIds.some((id) => !unlockSet.has(id));
      return {
        ...preset,
        locked,
        requiredUnlocks: unlockIds,
      };
    };

    const decoratedPresets = catalog.presets.map(computePresetLock);

    return {
      presets: decoratedPresets,
      cardSkins: decoratedCardSkins,
      tableSkins: decoratedTableSkins,
      pieceSkins: decoratedPieceSkins,
      backdrops: decoratedBackdrops,
    };
  }, [catalog, decorateItem, unlockSet]);

  const setThemeId = useCallback((nextThemeId) => {
    if (!nextThemeId) return;
    setThemeFromContext(nextThemeId);
    applyState((current) => {
      if (current.themeId === nextThemeId) {
        return current;
      }
      return { ...current, themeId: nextThemeId, presetId: null };
    });
  }, [applyState, setThemeFromContext]);

  const setCardSkin = useCallback((cardSkinId, options = {}) => {
    const entry = catalog.lookups.cardSkins.get(cardSkinId);
    if (!options.force && entry?.entitlement?.id && !unlockSet.has(entry.entitlement.id)) {
      return;
    }
    applyState((current) => ({ ...current, cardSkinId, presetId: null }));
  }, [applyState, catalog.lookups.cardSkins, unlockSet]);

  const setTableSkin = useCallback((tableSkinId, options = {}) => {
    const entry = catalog.lookups.tableSkins.get(tableSkinId);
    if (!options.force && entry?.entitlement?.id && !unlockSet.has(entry.entitlement.id)) {
      return;
    }
    applyState((current) => ({ ...current, tableSkinId, presetId: null }));
  }, [applyState, catalog.lookups.tableSkins, unlockSet]);

  const setPieceSkin = useCallback((pieceSkinId, options = {}) => {
    const entry = catalog.lookups.pieceSkins.get(pieceSkinId);
    if (!options.force && entry?.entitlement?.id && !unlockSet.has(entry.entitlement.id)) {
      return;
    }
    applyState((current) => ({ ...current, pieceSkinId, presetId: null }));
  }, [applyState, catalog.lookups.pieceSkins, unlockSet]);

  const setBackdrop = useCallback((backdropId, options = {}) => {
    const entry = catalog.lookups.backdrops.get(backdropId);
    if (!options.force && entry?.entitlement?.id && !unlockSet.has(entry.entitlement.id)) {
      return;
    }
    applyState((current) => ({ ...current, backdropId, presetId: null }));
  }, [applyState, catalog.lookups.backdrops, unlockSet]);

  const toggleAccessibility = useCallback((flag) => {
    if (!(flag in defaultAccessibility)) {
      return;
    }
    applyState((current) => ({
      ...current,
      accessibility: {
        ...current.accessibility,
        [flag]: !current.accessibility?.[flag],
      },
      presetId: null,
    }));
  }, [applyState]);

  const unlockItems = useCallback((ids = []) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      return false;
    }

    const pendingUnlocks = [];
    ids.forEach((id) => {
      if (
        typeof id === 'string'
        && id.length > 0
        && !unlockSet.has(id)
        && !pendingUnlocks.includes(id)
      ) {
        pendingUnlocks.push(id);
      }
    });

    if (pendingUnlocks.length === 0) {
      return false;
    }

    setUnlocks((current) => {
      const next = new Set(current);
      pendingUnlocks.forEach((id) => {
        next.add(id);
      });
      unlocksDirtyRef.current = true;
      return Array.from(next);
    });

    return true;
  }, [unlockSet]);

  const unlockItem = useCallback((unlockId) => unlockItems([unlockId]), [unlockItems]);

  const applyPreset = useCallback((presetId, options = {}) => {
    const preset = catalog.lookups.presets.get(presetId);
    if (!preset) {
      return;
    }

    const requirementIds = [];
    const collect = (entry) => {
      if (entry?.entitlement?.id) {
        requirementIds.push(entry.entitlement.id);
      }
    };
    collect(catalog.lookups.cardSkins.get(preset.cardSkinId));
    collect(catalog.lookups.tableSkins.get(preset.tableSkinId));
    collect(catalog.lookups.pieceSkins.get(preset.pieceSkinId));
    collect(catalog.lookups.backdrops.get(preset.backdropId));

    const isLocked = requirementIds.some((id) => !unlockSet.has(id));
    if (isLocked && !options.force) {
      return;
    }

    if (preset.themeId && preset.themeId !== state.themeId) {
      setThemeFromContext(preset.themeId);
    }

    applyState((current) => {
      const nextThemeId = preset.themeId ?? current.themeId;
      const next = {
        ...current,
        themeId: nextThemeId,
        presetId: preset.id,
        cardSkinId: preset.cardSkinId ?? current.cardSkinId,
        tableSkinId: preset.tableSkinId ?? current.tableSkinId,
        pieceSkinId: preset.pieceSkinId ?? current.pieceSkinId,
        backdropId: preset.backdropId ?? current.backdropId,
      };
      if (preset.accessibility) {
        next.accessibility = {
          ...current.accessibility,
          ...preset.accessibility,
        };
      }
      const combinedUnlocks = options.force ? Array.from(new Set([...unlockSet, ...requirementIds])) : [];
      return ensureUnlockedSelections(next, unlockSet, combinedUnlocks);
    });
  }, [applyState, catalog.lookups, ensureUnlockedSelections, setThemeFromContext, state.themeId, unlockSet]);

  const applyDefaults = useCallback((defaults, { force = true, forcePreset = true } = {}) => {
    if (!defaults) {
      return false;
    }

    let changed = false;
    const {
      themeId,
      presetId,
      cardSkinId,
      tableSkinId,
      pieceSkinId,
      backdropId,
      accessibility: accessibilityDefaults,
    } = defaults;

    if (themeId && themeId !== state.themeId) {
      setThemeId(themeId);
      changed = true;
    }

    if (presetId) {
      if (forcePreset || state.presetId !== presetId) {
        applyPreset(presetId, { force });
        changed = true;
      }
    } else {
      if (cardSkinId) {
        setCardSkin(cardSkinId, { force });
        changed = true;
      }
      if (tableSkinId) {
        setTableSkin(tableSkinId, { force });
        changed = true;
      }
      if (pieceSkinId) {
        setPieceSkin(pieceSkinId, { force });
        changed = true;
      }
      if (backdropId) {
        setBackdrop(backdropId, { force });
        changed = true;
      }
    }

    if (accessibilityDefaults) {
      applyState((current) => ({
        ...current,
        accessibility: {
          ...current.accessibility,
          ...ensureAccessibility(accessibilityDefaults),
        },
      }));
      changed = true;
    }

    return changed;
  }, [
    applyPreset,
    applyState,
    setBackdrop,
    setCardSkin,
    setPieceSkin,
    setTableSkin,
    setThemeId,
    state.themeId,
    state.presetId,
  ]);

  const setEngineDefaults = useCallback((engineId, defaults, options = {}) => {
    const suggestion = defaults
      ? createSuggestedState(defaults.themeId ?? state.themeId, defaults)
      : null;
    const sanitized = suggestion
      ? sanitiseState(suggestion, suggestion.themeId ?? state.themeId)
      : null;

    const previous = engineDefaultsRef.current;
    const changed = previous.engineId !== engineId || !areStatesEqual(previous.defaults, sanitized);

    engineDefaultsRef.current = { engineId, defaults: sanitized };

    const shouldApply = options.apply
      ?? (options.applyOnChange && changed);

    if (shouldApply && sanitized) {
      applyDefaults(sanitized, { force: options.force !== false, forcePreset: options.forcePreset !== false });
    }

    if (!sanitized && options.resetWhenMissing) {
      const fallback = sanitiseState(createSuggestedState(state.themeId), state.themeId);
      applyDefaults(fallback, { force: options.force !== false, forcePreset: options.forcePreset !== false });
    }

    return changed;
  }, [applyDefaults, state.themeId]);


  const reset = useCallback(() => {
    const defaults = engineDefaultsRef.current.defaults
      ?? sanitiseState(createSuggestedState(state.themeId), state.themeId);
    applyDefaults(defaults, { force: true });
  }, [applyDefaults, state.themeId]);

  const hydrateFromProfile = useCallback((value, { updatedAt: incomingUpdatedAt } = {}) => {
    if (!value) {
      return;
    }
    const { unlocks: incomingUnlocks, ...rest } = value;
    const sanitizedUnlocks = sanitiseUnlockArray(incomingUnlocks);
    if (sanitizedUnlocks.length || unlocks.length) {
      setUnlocks((current) => {
        const next = sanitiseUnlockArray(sanitizedUnlocks);
        if (current.length === next.length && current.every((id) => next.includes(id))) {
          return current;
        }
        return next;
      });
    }
    const sanitizedState = sanitiseState(rest, rest.themeId ?? state.themeId);
    applyState(() => sanitizedState, {
      updatedAt: typeof incomingUpdatedAt === 'number' ? incomingUpdatedAt : Date.now(),
      source: 'remote',
    });
  }, [applyState, state.themeId, unlocks]);

  const setSyncStatus = useCallback((status, error = null) => {
    setSyncState((current) => {
      if (current.status === status && current.error === error) {
        return current;
      }
      return { status, error };
    });
  }, []);

  return {
    state,
    updatedAt,
    unlocks,
    available: availableOptions,
    setThemeId,
    setCardSkin,
    setTableSkin,
    setPieceSkin,
    setBackdrop,
    toggleAccessibility,
    applyDefaults,
    applyPreset,
    reset,
    hydrateFromProfile,
    unlockItem,
    unlockItems,
    isUnlocked: (unlockId) => !unlockId || unlockSet.has(unlockId),
    setSyncStatus,
    syncState,
    setEngineDefaults,
  };
};

export const defaultPreset = getPresetById(getDefaultPresetId());
