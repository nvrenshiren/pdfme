import React from 'react';
import { useTheme } from '../../contexts.js';

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Native textarea with token styling, replacing antd's `Input.TextArea`. */
export const TextArea = ({ style, ...rest }: TextAreaProps) => {
  const token = useTheme();
  return (
    <textarea
      style={{
        border: '1px solid #d9d9d9',
        borderRadius: token.borderRadius,
        padding: '4px 11px',
        fontSize: token.fontSize,
        fontFamily: 'inherit',
        color: token.colorText,
        boxSizing: 'border-box',
        ...style,
      }}
      {...rest}
    />
  );
};

export default TextArea;
