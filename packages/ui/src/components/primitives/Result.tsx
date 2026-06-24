import React from 'react';
import { useTheme } from '../../contexts.js';

export interface ResultProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
}

/** Centered status block replacing antd's `Result`. */
export const Result = ({ icon, title, subTitle, extra }: ResultProps) => {
  const token = useTheme();
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      {icon}
      {title != null && (
        <div style={{ color: token.colorText, fontSize: 24, marginBottom: 8 }}>{title}</div>
      )}
      {subTitle != null && (
        <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: token.fontSize, marginBottom: 16 }}>
          {subTitle}
        </div>
      )}
      {extra != null && <div>{extra}</div>}
    </div>
  );
};

export default Result;
