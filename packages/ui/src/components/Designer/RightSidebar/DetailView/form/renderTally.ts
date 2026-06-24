/**
 * Diagnostic: counts committed renders per field path. Exposed for tests to
 * assert that editing one field re-renders only that field. Negligible cost
 * (one Map write per field commit) and safe to leave in place.
 */
export const __fieldRenderTally = new Map<string, number>();
