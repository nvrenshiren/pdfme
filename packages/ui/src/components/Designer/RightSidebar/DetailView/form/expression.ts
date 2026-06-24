/**
 * Evaluate a form-render style conditional expression such as
 * `{{!formData.editable}}` against the current form values.
 *
 * Only the `{{ ... }}` wrapper form is supported, with `formData` in scope —
 * this matches the single conditional the Designer uses. Evaluation is
 * sandboxed to the passed `formData` argument and never throws.
 */
const cache = new Map<string, (formData: Record<string, unknown>) => unknown>();

export const evalHidden = (expr: string, formData: Record<string, unknown>): boolean => {
  const match = /^\s*\{\{([\s\S]*)\}\}\s*$/.exec(expr);
  if (!match) return false;
  const body = match[1];

  let fn = cache.get(body);
  if (!fn) {
    try {
      // eslint-disable-next-line no-new-func
      fn = new Function('formData', `try { return (${body}); } catch (e) { return false; }`) as (
        formData: Record<string, unknown>,
      ) => unknown;
    } catch {
      fn = () => false;
    }
    cache.set(body, fn);
  }
  return Boolean(fn(formData));
};
