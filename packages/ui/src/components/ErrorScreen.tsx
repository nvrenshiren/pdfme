import React, { useContext } from 'react';
import { Size } from '@pdfme/common';
import { I18nContext, useTheme } from '../contexts.js';
import { BACKGROUND_COLOR } from '../constants.js';
import { Result } from './primitives/index.js';

const ErrorScreen = ({ size, error }: { size: Size; error: Error }) => {
  const i18n = useContext(I18nContext);
  const token = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: BACKGROUND_COLOR,
        ...size,
      }}
    >
      <div style={{ width: 300, margin: '0 auto', background: token.colorBgLayout }}>
        <Result
          icon={null}
          title="ERROR"
          subTitle={i18n('errorOccurred')}
          extra={<span>{error.message}</span>}
        />
      </div>
    </div>
  );
};

export default ErrorScreen;
