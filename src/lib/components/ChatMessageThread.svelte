<script lang="ts">
	import { base } from '$app/paths';
	import { Thread } from '$lib/schema';
	import { CoState } from 'jazz-svelte';
	import { useCurrentRoute } from '$lib/context';
	let { threadId }: { threadId: string } = $props();

	let thread = $derived(new CoState(Thread, threadId));

	const route = useCurrentRoute();
</script>

<div
	class="text-base-600 dark:text-base-400 bg-base-200/50 dark:bg-base-900/40 border-base-300/50 dark:border-base-800/30 relative ml-10 inline-flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-sm sm:ml-12"
>
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
