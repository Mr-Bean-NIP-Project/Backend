import Big from 'big.js';

export function sumArrayOfObjects<T>(objects: Array<T>): T {
  if (!objects || objects.length == 0) return {} as T;
  return objects.reduce((a, obj) => {
    Object.entries(obj).forEach(([key, val]) => {
      a[key] = Big(a[key] || 0).add(val);
    });
    return a;
  });
}
