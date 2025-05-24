<script lang="ts">
	import { base } from '$app/paths';
	import { Thread } from '$lib/schema';
	import { CoState } from 'jazz-svelte';
	import { useCurrentRoute } from '$lib/context';
	import { cn } from '@fuxui/base';
	import RelativeTime from 'svelte-relative-time';
	let {
		threadId,
		indented = true,
		lastReadDate
	}: { threadId: string; indented?: boolean; lastReadDate?: Date } = $props();

	let thread = $derived(new CoState(Thread, threadId));

	const route = useCurrentRoute();

	// get the last message in the thread
	let lastMessage = $derived(thread.current?.timeline?.at(-1));

	let isNew = $derived.by(() => {
		if (!lastReadDate) return thread.current?.timeline?.length !== 0;
		if (!lastMessage) return false;
		let date = lastMessage.createdAt;
		if (!date) return false;

		return new Date(lastReadDate) < date;
	});
</script>

<div
	class={cn(
		'text-base-600 dark:text-base-400 bg-base-200/50 dark:bg-base-900/40 border-base-300/50 dark:border-base-800/30 relative inline-flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-sm',
		indented ? 'ml-10 sm:ml-12' : ''
	)}
>
	{#if isNew}
		<div class="absolute top-2 left-2">
			<div class="bg-accent-500 dark:bg-accent-600 size-2 rounded-full"></div>
		</div>
	{/if}
	<div class="flex items-center gap-2">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-4"
			><path
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M4.5 7.5h12c1.886 0 2.828 0 3.414.586s.586 1.528.586 3.414v1m-4-2h-12m12 3h-12m12 3h-12m11 3h-10a2 2 0 0 0-2 2h14a2 2 0 0 0-2-2m-10-15h10a2 2 0 0 0 2-2h-14a2 2 0 0 0 2 2"
				color="currentColor"
			/></svg
		>
		Thread
		<a
			href={`${base}/${route.spaceId}/channel/${route.channelId}/thread/${threadId}`}
			class="text-accent-600 dark:text-accent-400 font-medium"
		>
			<span class="absolute inset-0"></span>
			{thread.current?.name}</a
		>
		({thread.current?.timeline?.length} messages)

		{#if lastMessage}
			<span class="text-base-600 dark:text-base-400 text-xs">
				updated <RelativeTime date={lastMessage.createdAt} locale="en" />
			</span>
		{/if}
	</div>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="size-5"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
	</svg>
</div>
