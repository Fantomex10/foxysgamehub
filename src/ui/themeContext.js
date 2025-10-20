import { createContext } from "react";
import { defaultTheme, defaultThemeId } from "./theme.js";

export const ThemeContext = createContext({
  theme: defaultTheme,
  themeId: defaultThemeId,
  availableThemes: [],
  setThemeId: () => {},
});