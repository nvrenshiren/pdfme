import React, { useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  type Placement,
} from '@floating-ui/react';
import { toFloatingPlacement, type AntdPlacement } from './placement.js';

export interface TooltipProps {
  title: React.ReactNode;
  placement?: AntdPlacement | Placement;
  children: React.ReactNode;
}

/** Hover/focus tooltip replacing antd's `Tooltip`, built on @floating-ui/react. */
export const Tooltip = ({ title, placement = 'top', children }: TooltipProps) => {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: toFloatingPlacement(placement),
    middleware: [offset(6), flip(), shift({ padding: 5 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <>
      <span ref={refs.setReference} {...getReferenceProps()} style={{ display: 'inline-flex' }}>
        {children}
      </span>
      {open && title != null && title !== '' && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              background: 'rgba(0,0,0,0.85)',
              color: '#fff',
              padding: '6px 8px',
              borderRadius: 6,
              fontSize: 12,
              lineHeight: 1.4,
              maxWidth: 250,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            {...getFloatingProps()}
          >
            {title}
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export default Tooltip;
