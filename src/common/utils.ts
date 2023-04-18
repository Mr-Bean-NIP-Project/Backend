export function sumArrayOfObjects<T>(objects: Array<T>): T {
  if (!objects || objects.length == 0) return {} as T;
  return objects.reduce((a, obj) => {
    Object.entries(obj).forEach(([key, val]) => {
      a[key] = (Number(a[key]) || 0) + Number(val);
    });
    return a;
  });
}
