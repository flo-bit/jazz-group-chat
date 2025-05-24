import type { Loaded } from 'jazz-tools';
import { getContext } from 'svelte';
import type { MyAppAccount, Space } from './schema';

export function useMe(): { current: Loaded<typeof MyAppAccount> } | undefined {
	const me = getContext('me');
	return me as { current: Loaded<typeof MyAppAccount> };
}

export function useSpace(): { current: Loaded<typeof Space> } | undefined {
	const space = getContext('space');
	return space as { current: Loaded<typeof Space> };
}

export function useSpaceId(): string {
	const spaceId = getContext('spaceId');
	return spaceId as string;
}
