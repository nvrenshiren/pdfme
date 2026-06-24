import React from 'react';

export interface ButtonGroupProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Adjacent button row replacing antd's `Space.Compact`. Collapses the gap
 * between children so they read as a single segmented control.
 */
export const ButtonGroup = ({ children, style }: ButtonGroupProps) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', ...style }}>{children}</span>
);

export default ButtonGroup;
