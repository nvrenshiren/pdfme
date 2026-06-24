import type { Placement } from '@floating-ui/react';

/** The antd placement names the pdfme UI passed to Tooltip/Dropdown. */
export type AntdPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

const MAP: Record<AntdPlacement, Placement> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  topLeft: 'top-start',
  topRight: 'top-end',
  bottomLeft: 'bottom-start',
  bottomRight: 'bottom-end',
};

/** Translate an antd placement name to a @floating-ui placement (pass-through if already valid). */
export const toFloatingPlacement = (placement: AntdPlacement | Placement): Placement =>
  (MAP as Record<string, Placement>)[placement] ?? (placement as Placement);
