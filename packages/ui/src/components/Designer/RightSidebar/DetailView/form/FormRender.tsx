import React, { useEffect, useSyncExternalStore } from 'react';
import type { PropPanelSchema } from '@pdfme/common';
import { useTheme } from '../../../../../contexts.js';
import { FormItem } from '../../../../primitives/index.js';
import type { FormInstance, FormWidgets, FormWatch, NamePath } from './useForm.js';
import {
  TextInput,
  NumberInput,
  SelectInput,
  ColorInput,
  SwitchInput,
  CheckboxInput,
  type FieldProps,
} from './fields.js';
import { evalHidden } from './expression.js';
import { __fieldRenderTally } from './renderTally.js';

const CONTAINER_WIDGETS = new Set(['card', 'Card', 'lineTitle']);
const INLINE_WIDGETS = new Set(['switch', 'checkbox']);
const noop = () => undefined;

export interface FormRenderProps {
  form: FormInstance;
  schema: PropPanelSchema;
  widgets?: FormWidgets;
  watch?: FormWatch;
  /** Accepted for API parity with form-render; unused. */
  locale?: string;
}

const spanFor = (node: PropPanelSchema, parentColumn?: number): number => {
  if (typeof node.span === 'number') return Math.max(1, Math.min(24, node.span));
  if (parentColumn && parentColumn > 0) return Math.round(24 / parentColumn);
  return 24;
};

/** Signature of a single field's reactive state (its value + validation errors). */
const fieldSignature = (form: FormInstance, path: NamePath): string => {
  const v = form._getFieldValue(path);
  const e = form._getFieldErrors(path);
  const vs = v !== null && typeof v === 'object' ? JSON.stringify(v) : String(v);
  return `${vs}${e ? e.join('') : ''}`;
};

/**
 * Subscribe to the form store but only re-render when this field's own slice
 * changes — so typing in one field does not re-render the whole panel.
 */
const useFieldSlice = (form: FormInstance, path: NamePath): void => {
  const getSnapshot = () => fieldSignature(form, path);
  useSyncExternalStore(form._subscribe, getSnapshot, getSnapshot);
};

/**
 * Gate a field's visibility. Static (boolean) `hidden` never re-subscribes;
 * a `{{...}}` expression re-evaluates on any value change (rare — e.g. the
 * `required` field that depends on `editable`).
 */
const useHiddenGate = (form: FormInstance, dynamic: boolean): void => {
  const getSnapshot = () => (dynamic ? String(form._getVersion()) : '0');
  useSyncExternalStore(form._subscribe, getSnapshot, getSnapshot);
};

const Container = ({
  title,
  variant,
  children,
}: {
  title?: string;
  variant?: string;
  children: React.ReactNode;
}) => {
  const token = useTheme();
  const hasTitle = title != null && title !== '';

  // A title sitting on a divider line — used for box-dimension groups.
  if (variant === 'lineTitle') {
    return (
      <div style={{ marginBottom: token.marginXS }}>
        {hasTitle && (
          <div
            style={{
              fontSize: token.fontSize - 1,
              color: token.colorTextSecondary,
              borderBottom: `1px solid ${token.colorSplit}`,
              paddingBottom: 4,
              marginBottom: token.marginXS,
            }}
          >
            {title}
          </div>
        )}
        {children}
      </div>
    );
  }

  // Untitled object groups (e.g. position X/Y) render flush so they line up
  // with sibling fields instead of looking boxed-off.
  if (!hasTitle) {
    return <div style={{ marginBottom: token.marginXS }}>{children}</div>;
  }

  // Named sections (e.g. "Table Style") get a light card to group their fields.
  return (
    <div
      style={{
        marginBottom: token.marginXS,
        border: `1px solid ${token.colorSplit}`,
        borderRadius: token.borderRadius,
        padding: token.paddingSM,
      }}
    >
      <div
        style={{
          fontSize: token.fontSize - 1,
          fontWeight: 500,
          color: token.colorText,
          marginBottom: token.marginXS,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
};

const FieldGroup = ({
  form,
  properties,
  column,
  parentPath,
  widgets,
}: {
  form: FormInstance;
  properties?: Record<string, PropPanelSchema>;
  column?: number;
  parentPath: NamePath;
  widgets?: FormWidgets;
}) => {
  if (!properties) return null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(24, 1fr)',
        columnGap: 8,
        alignItems: 'start',
      }}
    >
      {Object.entries(properties).map(([key, node]) => (
        <FieldCell
          key={key}
          form={form}
          fieldKey={key}
          node={node}
          parentColumn={column}
          parentPath={parentPath}
          widgets={widgets}
        />
      ))}
    </div>
  );
};

const FieldCell = ({
  form,
  fieldKey,
  node,
  parentColumn,
  parentPath,
  widgets,
}: {
  form: FormInstance;
  fieldKey: string;
  node: PropPanelSchema;
  parentColumn?: number;
  parentPath: NamePath;
  widgets?: FormWidgets;
}) => {
  useHiddenGate(form, typeof node.hidden === 'string');
  const hidden =
    typeof node.hidden === 'string'
      ? evalHidden(node.hidden, form.getValues())
      : Boolean(node.hidden);
  if (hidden) return null;

  const path: NamePath = [...parentPath, fieldKey];
  const span = spanFor(node, parentColumn);

  let body: React.ReactNode;
  const CustomWidget = node.widget ? widgets?.[node.widget] : undefined;
  if (CustomWidget) {
    const bound = node.bind !== false && node.type !== 'void';
    body = (
      <CustomWidget
        schema={node}
        value={bound ? form._getFieldValue(path) : undefined}
        onChange={bound ? (v: unknown) => form._setFieldValue(path, v) : noop}
      />
    );
  } else if (
    (node.widget && CONTAINER_WIDGETS.has(node.widget)) ||
    (node.type === 'object' && node.properties)
  ) {
    body = (
      <Container title={node.title} variant={node.widget}>
        <FieldGroup
          form={form}
          properties={node.properties}
          column={node.column}
          parentPath={path}
          widgets={widgets}
        />
      </Container>
    );
  } else {
    body = <LeafField form={form} node={node} path={path} />;
  }

  return <div style={{ gridColumn: `span ${span}` }}>{body}</div>;
};

/** A value-bearing input that subscribes to its own store slice in isolation. */
const LeafField = ({
  form,
  node,
  path,
}: {
  form: FormInstance;
  node: PropPanelSchema;
  path: NamePath;
}) => {
  const token = useTheme();
  useFieldSlice(form, path);

  useEffect(() => {
    const key = path.join('.');
    __fieldRenderTally.set(key, (__fieldRenderTally.get(key) ?? 0) + 1);
  });

  const errors = form._getFieldErrors(path);
  const invalid = Boolean(errors && errors.length);
  const stored = form._getFieldValue(path);
  const fieldProps: FieldProps = {
    value: stored === undefined ? node.default : stored,
    onChange: (v: unknown) => form._setFieldValue(path, v),
    disabled: Boolean(node.disabled),
    placeholder: node.placeholder,
    props: {
      ...node.props,
      format: node.format,
      min: (node.props?.min as number | undefined) ?? node.min,
      max: (node.props?.max as number | undefined) ?? node.max,
    },
    invalid,
  };

  const widget =
    node.widget ?? (node.type === 'boolean' ? 'switch' : node.type === 'number' ? 'inputNumber' : 'text');

  let input: React.ReactNode;
  switch (widget) {
    case 'select':
      input = <SelectInput {...fieldProps} />;
      break;
    case 'inputNumber':
      input = <NumberInput {...fieldProps} />;
      break;
    case 'color':
      input = <ColorInput {...fieldProps} />;
      break;
    case 'switch':
      input = <SwitchInput {...fieldProps} />;
      break;
    case 'checkbox':
      input = <CheckboxInput {...fieldProps} />;
      break;
    default:
      input = <TextInput {...fieldProps} />;
  }

  const errorText = invalid ? (
    <div style={{ color: token.colorError, fontSize: token.fontSize - 2, marginTop: 2 }}>
      {errors?.[0]}
    </div>
  ) : null;

  if (INLINE_WIDGETS.has(widget)) {
    return (
      <div style={{ marginBottom: token.marginXS, minHeight: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 28 }}>
          {node.title != null && node.title !== '' && (
            <span style={{ fontSize: token.fontSize - 1, color: token.colorTextSecondary }}>
              {node.title}
            </span>
          )}
          {input}
        </div>
        {errorText}
      </div>
    );
  }

  return (
    <FormItem label={node.title}>
      {input}
      {errorText}
    </FormItem>
  );
};

/** Schema-driven form renderer replacing form-render's default export. */
const FormRender = ({ form, schema, widgets, watch }: FormRenderProps) => {
  form._configure(schema, widgets, watch);
  return (
    <FieldGroup
      form={form}
      properties={schema.properties}
      column={schema.column}
      parentPath={[]}
      widgets={widgets}
    />
  );
};

export default FormRender;
