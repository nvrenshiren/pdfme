import type { UIOptionsTheme } from '@pdfme/common';

/**
 * Flattened design token consumed across the pdfme UI via `useTheme()`.
 * Replaces antd's `theme.useToken()` so the package no longer depends on
 * Ant Design. Field names and default values intentionally mirror the antd
 * tokens previously relied upon, so existing visuals stay unchanged.
 */
export interface Token {
  colorPrimary: string;
  colorPrimaryBg: string;
  colorPrimaryBorder: string;
  colorBgMask: string;
  colorWhite: string;
  colorText: string;
  colorTextSecondary: string;
  colorBgLayout: string;
  colorSplit: string;
  colorError: string;
  fontSize: number;
  borderRadius: number;
  paddingSM: number;
  paddingXS: number;
  paddingXXS: number;
  marginXS: number;
  marginXXS: number;
}

/**
 * Default token values. These match the values antd previously computed from
 * its default algorithm seeded with `colorPrimary: '#38a0ff'`, so the rewrite
 * is visually identical to the antd-based implementation.
 */
export const defaultToken: Token = {
  colorPrimary: '#38a0ff',
  colorPrimaryBg: '#f0faff',
  colorPrimaryBorder: '#b3e2ff',
  colorBgMask: 'rgba(0,0,0,0.45)',
  colorWhite: '#fff',
  colorText: 'rgba(0,0,0,0.88)',
  colorTextSecondary: 'rgba(0,0,0,0.65)',
  colorBgLayout: '#f5f5f5',
  colorSplit: 'rgba(5,5,5,0.06)',
  colorError: '#ff4d4f',
  fontSize: 14,
  borderRadius: 6,
  paddingSM: 12,
  paddingXS: 8,
  paddingXXS: 4,
  marginXS: 8,
  marginXXS: 4,
};

/**
 * Public default theme, exposed in the {@link UIOptionsTheme} shape so user
 * overrides passed via `options.theme` merge cleanly. Unlike antd, derived
 * tokens (e.g. `colorPrimaryBg`) are not recomputed from `colorPrimary`;
 * override individual tokens directly when a different value is required.
 */
export const defaultTheme: UIOptionsTheme = {
  token: { colorPrimary: defaultToken.colorPrimary },
};

/**
 * Resolve the effective flattened {@link Token} from optional user overrides.
 * Token-level overrides win over defaults; unknown keys are ignored by the UI
 * but preserved for plugins that read them via {@link UITheme}.
 */
export const resolveToken = (optionsTheme?: UIOptionsTheme): Token => ({
  ...defaultToken,
  ...(optionsTheme?.token as Partial<Token> | undefined),
});
