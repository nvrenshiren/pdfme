import React from 'react';
import { useTheme } from '../../contexts.js';

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  strong?: boolean;
}

/** Inline text replacing antd's `Typography.Text`. */
export const Text = ({ strong, style, children, ...rest }: TextProps) => {
  const token = useTheme();
  return (
    <span
      style={{ color: token.colorText, fontWeight: strong ? 600 : undefined, ...style }}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Text;
