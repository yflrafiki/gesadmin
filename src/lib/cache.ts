const store = new Map<string, { data: unknown; expiresAt: number }>();

export function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() < hit.expiresAt) {
    return Promise.resolve(hit.data as T);
  }
  return fetcher().then(data => {
    store.set(key, { data, expiresAt: Date.now() + ttlMs });
    return data;
  });
}

export function bust(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
