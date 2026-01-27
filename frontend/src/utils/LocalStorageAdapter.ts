// LocalStorageAdapter.ts
// Utility for CRUD operations in localStorage for RTK Query replacement

export function getAll<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

export function getById<T>(key: string, id: string): T | undefined {
    return getAll<T>(key).find((item: any) => item.id === id);
}

export function add<T extends { id: string }>(key: string, item: T): void {
    const items = getAll<T>(key);
    items.push(item);
    localStorage.setItem(key, JSON.stringify(items));
}

export function update<T extends { id: string }>(key: string, item: T): void {
    let items = getAll<T>(key);
    items = items.map((i: T) => (i.id === item.id ? item : i));
    localStorage.setItem(key, JSON.stringify(items));
}

export function remove(key: string, id: string): void {
    let items = getAll<any>(key);
    items = items.filter((i: any) => i.id !== id);
    localStorage.setItem(key, JSON.stringify(items));
}
