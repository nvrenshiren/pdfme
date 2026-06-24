import { useRef } from 'react';
import type { PropPanelSchema } from '@pdfme/common';
import { getByPath, setByPath, clone } from './path.js';
import { runFieldRules, collectBoundFields } from './validate.js';

/** A path into the (possibly nested) form values, e.g. ['position', 'x']. */
export type NamePath = (string | number)[];

/** Shape rejected by {@link FormInstance.validateFields}, mirroring the subset
 * of rc-field-form's ValidateErrorEntity that the Designer consumed. */
export interface ValidateErrorEntity {
  values: Record<string, unknown>;
  errorFields: { name: NamePath; errors: string[] }[];
  outOfDate: boolean;
}

/** Props FormRender passes to a custom widget component (the rest is supplied
 * by the Designer's widget closures). */
export interface FormWidgetCallProps {
  schema: PropPanelSchema;
  value?: unknown;
  onChange?: (value: unknown) => void;
}
export type FormWidgets = Record<string, React.ComponentType<FormWidgetCallProps>>;
export type FormWatch = Record<string, (values: Record<string, unknown>) => void>;

interface InternalState {
  values: Record<string, unknown>;
  /** Validation messages keyed by dotted path (e.g. "position.x"). */
  errors: Record<string, string[]>;
  schema?: PropPanelSchema;
  widgets?: FormWidgets;
  watch?: FormWatch;
  version: number;
  listeners: Set<() => void>;
}

export interface FormInstance {
  getValues(): Record<string, unknown>;
  /** Replace all values without triggering the watch callback (programmatic). */
  setValues(values: Record<string, unknown>): void;
  /** Clear values and validation errors without triggering the watch callback. */
  resetFields(): void;
  /** Validate every bound field; resolves with values, rejects with {@link ValidateErrorEntity}. */
  validateFields(): Promise<Record<string, unknown>>;

  // --- internals consumed by FormRender / field components ---
  _state: InternalState;
  _subscribe(fn: () => void): () => void;
  _getVersion(): number;
  _getFieldValue(path: NamePath): unknown;
  /** Set one field from a user interaction; updates value and fires the watch callback. */
  _setFieldValue(path: NamePath, value: unknown): void;
  _getFieldErrors(path: NamePath): string[] | undefined;
  _configure(schema: PropPanelSchema, widgets?: FormWidgets, watch?: FormWatch): void;
}

const pathKey = (path: NamePath) => path.join('.');

const createForm = (): FormInstance => {
  const state: InternalState = {
    values: {},
    errors: {},
    version: 0,
    listeners: new Set(),
  };

  const emit = () => {
    state.version += 1;
    state.listeners.forEach((fn) => fn());
  };

  const instance: FormInstance = {
    _state: state,

    getValues: () => state.values,

    setValues: (values) => {
      state.values = clone(values);
      state.errors = {};
      emit();
    },

    resetFields: () => {
      state.values = {};
      state.errors = {};
      emit();
    },

    validateFields: () => {
      const fields = state.schema ? collectBoundFields(state.schema) : [];
      const errorFields: ValidateErrorEntity['errorFields'] = [];
      const nextErrors: Record<string, string[]> = {};

      for (const field of fields) {
        const value = getByPath(state.values, field.path);
        const errors = runFieldRules(field.node, value);
        if (errors.length) {
          nextErrors[pathKey(field.path)] = errors;
          errorFields.push({ name: field.path, errors });
        }
      }

      state.errors = nextErrors;
      emit();

      if (errorFields.length) {
        return Promise.reject<Record<string, unknown>>({
          values: state.values,
          errorFields,
          outOfDate: false,
        } satisfies ValidateErrorEntity);
      }
      return Promise.resolve(state.values);
    },

    _subscribe: (fn) => {
      state.listeners.add(fn);
      return () => state.listeners.delete(fn);
    },

    _getVersion: () => state.version,

    _getFieldValue: (path) => getByPath(state.values, path),

    _setFieldValue: (path, value) => {
      state.values = setByPath(state.values, path, value);
      // Clear this field's error optimistically; full validation runs via the watch handler.
      delete state.errors[pathKey(path)];
      emit();
      state.watch?.['#']?.(state.values);
    },

    _getFieldErrors: (path) => state.errors[pathKey(path)],

    _configure: (schema, widgets, watch) => {
      state.schema = schema;
      state.widgets = widgets;
      state.watch = watch;
    },
  };

  return instance;
};

/** Create a stable form instance, mirroring form-render's `useForm()`. */
export const useForm = (): FormInstance => {
  const ref = useRef<FormInstance | null>(null);
  if (!ref.current) ref.current = createForm();
  return ref.current;
};
