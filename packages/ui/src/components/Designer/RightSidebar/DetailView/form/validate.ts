import type { PropPanelSchema, PropPanelRule } from '@pdfme/common';
import type { NamePath } from './useForm.js';

export interface BoundField {
  path: NamePath;
  node: PropPanelSchema;
}

const isContainer = (node: PropPanelSchema): boolean =>
  Boolean(node.properties) &&
  (node.type === 'object' ||
    node.widget === 'card' ||
    node.widget === 'Card' ||
    node.widget === 'lineTitle');

const isEmpty = (value: unknown): boolean =>
  value === undefined || value === null || value === '';

/**
 * Walk a propPanel schema tree and collect every leaf field that carries a
 * form value. Containers are recursed into; `void` widgets and `bind: false`
 * fields (which manage their own state) are skipped.
 */
export const collectBoundFields = (root: PropPanelSchema): BoundField[] => {
  const out: BoundField[] = [];
  const walk = (properties: Record<string, PropPanelSchema> | undefined, parent: NamePath) => {
    if (!properties) return;
    for (const [key, node] of Object.entries(properties)) {
      const path = [...parent, key];
      if (isContainer(node)) {
        walk(node.properties, path);
      } else if (node.type === 'void' || node.bind === false) {
        // not a value-bearing field
      } else {
        out.push({ path, node });
      }
    }
  };
  walk(root.properties, []);
  return out;
};

/** Run a field's required/pattern/validator rules, returning error messages. */
export const runFieldRules = (node: PropPanelSchema, value: unknown): string[] => {
  const errors: string[] = [];

  if (node.required && isEmpty(value)) {
    errors.push(`${node.title ?? 'This field'} is required`);
  }

  const rules: PropPanelRule[] = Array.isArray(node.rules) ? node.rules : [];
  for (const rule of rules) {
    const message = typeof rule.message === 'string' ? rule.message : 'Invalid value';

    if (rule.pattern && !isEmpty(value)) {
      const re = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
      if (!re.test(String(value))) {
        errors.push(message);
        continue;
      }
    }

    if (typeof rule.validator === 'function') {
      let valid = true;
      try {
        // pdfme validators are synchronous and return false when invalid.
        const result = rule.validator(rule, value) as unknown;
        if (result === false) valid = false;
      } catch {
        valid = false;
      }
      if (!valid) errors.push(message);
    }
  }

  return errors;
};
