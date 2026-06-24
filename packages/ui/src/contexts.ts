import { createContext, useContext } from 'react';
import { i18n } from './i18n.js';
import { getDefaultFont, PluginRegistry, pluginRegistry, UIOptions } from '@pdfme/common';
import { builtInPlugins } from '@pdfme/schemas/builtins';
import { defaultToken, type Token } from './theme.js';

export const I18nContext = createContext(i18n);

export const ThemeContext = createContext<Token>(defaultToken);

/** Access the resolved pdfme design token. Replaces antd's `theme.useToken()`. */
export const useTheme = (): Token => useContext(ThemeContext);

export const FontContext = createContext(getDefaultFont());

export const PluginsRegistry = createContext<PluginRegistry>(pluginRegistry(builtInPlugins));

export const OptionsContext = createContext<UIOptions>({});

export const CacheContext = createContext<Map<string | number, unknown>>(new Map());
