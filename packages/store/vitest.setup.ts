// Node 24+ exposes an inert experimental `localStorage` global that blocks
// jsdom/node environments from providing a working one. Zustand's persist
// middleware needs a real storage, so install a Map-backed shim.
class MemoryStorage {
	private map = new Map<string, string>();

	getItem(key: string): string | null {
		return this.map.has(key) ? (this.map.get(key) as string) : null;
	}

	setItem(key: string, value: string): void {
		this.map.set(String(key), String(value));
	}

	removeItem(key: string): void {
		this.map.delete(key);
	}

	clear(): void {
		this.map.clear();
	}

	key(index: number): string | null {
		return ([...this.map.keys()][index] as string) ?? null;
	}

	get length(): number {
		return this.map.size;
	}
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", {
	value: storage,
	configurable: true,
	writable: true,
});

// Zustand's persist middleware defaults to `window.localStorage`.
Object.defineProperty(globalThis, "window", {
	value: { localStorage: storage },
	configurable: true,
	writable: true,
});
