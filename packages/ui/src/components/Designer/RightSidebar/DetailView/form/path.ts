type Path = (string | number)[];
type Dict = Record<string, unknown>;

/** Read a nested value by path; returns undefined if any segment is missing. */
export const getByPath = (obj: Dict, path: Path): unknown => {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Dict)[key as string];
  }
  return cur;
};

/** Immutably set a nested value by path, cloning only the touched branch. */
export const setByPath = (obj: Dict, path: Path, value: unknown): Dict => {
  if (path.length === 0) return obj;
  const [head, ...rest] = path;
  const next: Dict = { ...obj };
  if (rest.length === 0) {
    next[head as string] = value;
  } else {
    const child = next[head as string];
    next[head as string] = setByPath(
      child && typeof child === 'object' ? (child as Dict) : {},
      rest,
      value,
    );
  }
  return next;
};

/** Structured clone falling back to a JSON round-trip for older runtimes. */
export const clone = <T>(value: T): T => {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      /* fall through for non-cloneable values */
    }
  }
  return JSON.parse(JSON.stringify(value)) as T;
};
