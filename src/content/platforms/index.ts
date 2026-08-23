import { PlatformAdapter } from './types';
import { getirAdapter } from './getir';
import { tgoAdapter } from './tgo';

export const ADAPTERS: PlatformAdapter[] = [getirAdapter, tgoAdapter];

/** The adapter that owns the current page, or null on an unsupported site. */
export function detectPlatform(url: string = window.location.href): PlatformAdapter | null {
    return ADAPTERS.find((adapter) => adapter.matches(url)) ?? null;
}

export type { PlatformAdapter };
export { storageKey } from './types';
