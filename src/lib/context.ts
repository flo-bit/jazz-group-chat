import { getContext } from 'svelte';

export function useCurrentRoute(): { spaceId?: string; channelId?: string; threadId?: string } {
	const route = getContext('route');
	return route as { spaceId?: string; channelId?: string; threadId?: string };
}
