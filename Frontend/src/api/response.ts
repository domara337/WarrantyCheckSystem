export const readArrayResponse = <T>(payload: unknown, resource: string): T[] => {
  
  //check if the payload is an array, if so return it as T[]
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  //check if the payload is an object with a 'data' property that is an array, if so return the 'data' property as T[]
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    Array.isArray(payload.data)
  ) {
    return payload.data as T[];
  }

  //if the payload is neither an array nor an object with a 'data' property that is an array, throw a TypeError
  throw new TypeError(`${resource} API response must contain an array.`);
};
