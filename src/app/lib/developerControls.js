const cycleOption = (options, current) => {
  if (!Array.isArray(options) || options.length === 0) {
    return current;
  }
  const index = options.indexOf(current);
  if (index === -1) {
    return options[0];
  }
  return options[(index + 1) % options.length];
};

export const buildDeveloperMenu = ({
  serviceConfig,
  sessionAdapters,
  photonAdapters,
  availableThemes,
  themeId,
  setThemeId,
  updateServiceConfig,
}) => {
  if (!serviceConfig) {
    return null;
  }

  const sessionOptions = sessionAdapters ?? [];
  const photonOptions = photonAdapters ?? [];
  const themeOptions = availableThemes ?? [];
  const currentTheme = themeOptions.find((entry) => entry.id === themeId) ?? themeOptions[0];

  const items = [
    {
      label: `Session adapter: ${serviceConfig.sessionAdapter}`,
      onClick: () => updateServiceConfig((current) => ({
        ...current,
        sessionAdapter: cycleOption(sessionOptions, current.sessionAdapter),
      })),
      disabled: sessionOptions.length <= 1,
    },
    {
      label: `Photon adapter: ${serviceConfig.photonAdapter}`,
      onClick: () => updateServiceConfig((current) => ({
        ...current,
        photonAdapter: cycleOption(photonOptions, current.photonAdapter),
      })),
      disabled: photonOptions.length <= 1,
    },
    {
      label: `Theme: ${currentTheme?.name ?? themeId}`,
      onClick: () => {
        if (!themeOptions.length) return;
        const ids = themeOptions.map((entry) => entry.id);
        const nextId = cycleOption(ids, themeId);
        setThemeId(nextId);
      },
      disabled: themeOptions.length <= 1,
    },
  ];

  return {
    title: 'Developer toggles',
    items,
  };
};

export const __internal = { cycleOption };
