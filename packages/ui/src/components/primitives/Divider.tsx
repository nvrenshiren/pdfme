import React from 'react';
import { useTheme } from '../../contexts.js';

export interface DividerProps {
  style?: React.CSSProperties;
  type?: 'horizontal' | 'vertical';
}

/** Thin separator replacing antd's `Divider`. */
export const Divider = ({ style, type = 'horizontal' }: DividerProps) => {
  const token = useTheme();
  if (type === 'vertical') {
    return (
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 1,
          height: '0.9em',
          background: token.colorSplit,
          margin: '0 8px',
          ...style,
        }}
      />
    );
  }
  return (
    <div
      aria-hidden
      style={{ height: 1, width: '100%', background: token.colorSplit, margin: '8px 0', ...style }}
    />
  );
};

export default Divider;
