import React from 'react';
import { Size } from '@pdfme/common';
import { RULER_HEIGHT } from '../../../constants.js';
import { useTheme } from '../../../contexts.js';

const Mask = ({ width, height }: Size) => {
  const token = useTheme();
  return (
    <div
      style={{
        position: 'absolute',
        top: -RULER_HEIGHT,
        left: -RULER_HEIGHT,
        zIndex: 100,
        width,
        height,
        background: token.colorBgMask,
      }}
    />
  );
};

export default Mask;
