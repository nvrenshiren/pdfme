import React from 'react';
import { useTheme } from '../../contexts.js';

export interface FormItemProps {
  label?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/** Label-over-control field wrapper replacing antd's `Form.Item`. */
export const FormItem = ({ label, children, style }: FormItemProps) => {
  const token = useTheme();
  return (
    <div style={{ marginBottom: token.marginXS, ...style }}>
      {label != null && label !== '' && (
        <label
          style={{
            display: 'block',
            marginBottom: 4,
            fontSize: token.fontSize - 1,
            lineHeight: 1.4,
            color: token.colorTextSecondary,
          }}
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
};

export default FormItem;
