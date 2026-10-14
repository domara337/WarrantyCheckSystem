export const readArrayResponse = <T>(payload: unknown, resource: string): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    Array.isArray(payload.data)
  ) {
    return payload.data as T[];
  }

  throw new TypeError(`${resource} API response must contain an array.`);
};
