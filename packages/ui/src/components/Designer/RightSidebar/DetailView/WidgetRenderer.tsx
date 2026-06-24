import React, { useEffect, useRef } from 'react';
import type {
  PropPanelWidgetProps,
  PropPanelSchema,
  SchemaForUI,
  BasePdf,
  ChangeSchemas,
  UIOptions,
  UITheme,
} from '@pdfme/common';

// `rootElement` is created by this component (its own ref) and supplied to the
// widget — it is not passed in. The remaining context is forwarded explicitly
// (a plain Omit on PropPanelWidgetProps is lossy due to its index signature).
interface Props {
  widget: (props: PropPanelWidgetProps) => void;
  schema?: PropPanelSchema;
  value?: unknown;
  onChange?: (value: unknown) => unknown;
  activeSchema: SchemaForUI;
  activeElements: HTMLElement[];
  schemas: SchemaForUI[];
  basePdf?: BasePdf;
  changeSchemas: ChangeSchemas;
  options: UIOptions;
  theme: UITheme;
  i18n: (key: string) => string;
}

const WidgetRenderer = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      const { widget, ...otherProps } = props;
      element.innerHTML = '';
      widget({ ...otherProps, rootElement: element });
    }

    return () => {
      if (element) {
        element.innerHTML = '';
      }
    };
  }, [props]);

  return <div ref={ref} />;
};

export default WidgetRenderer;
