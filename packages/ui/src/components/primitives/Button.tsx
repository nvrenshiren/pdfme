import React, { useState } from 'react';
import { useTheme } from '../../contexts.js';

const NEUTRAL_BORDER = '#d9d9d9';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Visual variant. Mirrors the subset of antd's `type` the UI relied on. */
  type?: 'default' | 'text' | 'primary';
  /** Outlined primary (transparent background) — used for active toggle buttons. */
  ghost?: boolean;
  size?: 'small' | 'middle';
  icon?: React.ReactNode;
}

/**
 * Minimal themeable button replacing antd's `Button`. Always renders a native
 * `type="button"` so it never accidentally submits a surrounding form.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    type = 'default',
    ghost = false,
    size = 'middle',
    icon,
    children,
    style,
    disabled,
    onMouseEnter,
    onMouseLeave,
    ...rest
  },
  ref,
) {
  const token = useTheme();
  const [hover, setHover] = useState(false);
  const active = hover && !disabled;
  const hasChildren = children !== undefined && children !== null && children !== false;

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hasChildren && icon ? 6 : 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: token.fontSize,
    lineHeight: 1,
    borderRadius: token.borderRadius,
    height: size === 'small' ? 24 : 32,
    padding: size === 'small' ? '0 7px' : '4px 15px',
    boxSizing: 'border-box',
    transition: 'all 0.1s',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  // Each variant sets a full `border` shorthand so it never mixes with a
  // longhand `borderColor` (which React/CSSOM can drop the style segment from).
  let variant: React.CSSProperties;
  if (type === 'primary' && ghost) {
    variant = {
      background: 'transparent',
      border: `1px solid ${token.colorPrimary}`,
      color: token.colorPrimary,
      opacity: active ? 0.75 : base.opacity,
    };
  } else if (type === 'primary') {
    variant = {
      background: token.colorPrimary,
      border: `1px solid ${token.colorPrimary}`,
      color: token.colorWhite,
      opacity: active ? 0.85 : base.opacity,
    };
  } else if (type === 'text') {
    variant = {
      background: active ? 'rgba(0,0,0,0.06)' : 'transparent',
      border: '1px solid transparent',
      color: token.colorText,
    };
  } else {
    variant = {
      background: token.colorWhite,
      border: `1px solid ${active ? token.colorPrimary : NEUTRAL_BORDER}`,
      color: active ? token.colorPrimary : token.colorText,
    };
  }

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      style={{ ...base, ...variant, ...style }}
      onMouseEnter={(e) => {
        setHover(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHover(false);
        onMouseLeave?.(e);
      }}
      {...rest}
    >
      {icon}
      {hasChildren && <span>{children}</span>}
    </button>
  );
});

export default Button;
