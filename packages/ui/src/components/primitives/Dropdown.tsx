import React, { useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
  type Placement,
} from '@floating-ui/react';
import { useTheme } from '../../contexts.js';
import { toFloatingPlacement, type AntdPlacement } from './placement.js';

export interface MenuItem {
  key: string;
  label: React.ReactNode;
}

export interface DropdownProps {
  menu: { items?: MenuItem[] };
  placement?: AntdPlacement | Placement;
  /** Accepted for API parity with antd; this implementation always opens on click. */
  trigger?: Array<'click'>;
  /** Accepted for API parity with antd; no arrow is rendered. */
  arrow?: boolean;
  children: React.ReactNode;
}

/** Click-triggered menu replacing antd's `Dropdown`, built on @floating-ui/react. */
export const Dropdown = ({ menu, placement = 'bottomLeft', children }: DropdownProps) => {
  const token = useTheme();
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: toFloatingPlacement(placement),
    middleware: [offset(6), flip(), shift({ padding: 5 })],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const items = menu.items ?? [];

  return (
    <>
      <span ref={refs.setReference} {...getReferenceProps()} style={{ display: 'inline-flex' }}>
        {children}
      </span>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={{
                ...floatingStyles,
                background: token.colorWhite,
                borderRadius: token.borderRadius,
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                padding: 4,
                minWidth: 120,
                zIndex: 9999,
              }}
              {...getFloatingProps()}
            >
              {items.map((it) => (
                <div
                  key={it.key}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => setOpen(false)}
                  style={{
                    padding: '5px 12px',
                    cursor: 'pointer',
                    borderRadius: 4,
                    fontSize: token.fontSize,
                    color: token.colorText,
                  }}
                >
                  {it.label}
                </div>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};

export default Dropdown;
