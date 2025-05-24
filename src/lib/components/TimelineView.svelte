<script lang="ts">
	import type { Message, MyAppAccount } from '$lib/schema';
	import type { Loaded } from 'jazz-tools';
	import ChatMessage from './ChatMessage.svelte';
	import { Virtualizer } from 'virtua/svelte';
	import { page } from '$app/state';
	import { setContext } from 'svelte';
	import { view } from '../../routes/[spaceId]/view.svelte';

	let viewport: HTMLDivElement = $state(null!);
	let virtualizer: Virtualizer<string> | undefined = $state();

	let {
		timeline,
		setReplyTo,
		me,
		createThread,
		allowThreadCreation = true,
		showThread = true
	}: {
		timeline: Loaded<typeof Message>[];
		setReplyTo: (message: Loaded<typeof Message>) => void;
		me: Loaded<typeof MyAppAccount>;
		createThread: (message: Loaded<typeof Message>) => void;
		allowThreadCreation?: boolean;
		showThread?: boolean;
	} = $props();

	setContext('scrollTo', (id: string) => {
		let index = timeline.findIndex((m) => m.id === id);
		if (index !== -1) {
			virtualizer?.scrollToIndex(index, { smooth: true });
		}
	});

	let messageCount: number | undefined = $state(timeline?.length);

	$effect(() => {
		page.route;
		view.active;

		if (!messageCount) return;
		setTimeout(() => {
			if (!virtualizer) return;

			virtualizer.scrollToIndex((messageCount ?? 0) - 1);
		});
	});

	$effect(() => {
		if ((messageCount ?? 0) < (timeline?.length ?? 0)) {
			messageCount = timeline?.length;
		}
	});
</script>

<div
	class="absolute inset-0 left-0 h-screen overflow-y-scroll px-4 py-24 lg:left-80"
	bind:this={viewport}
>
	{#if timeline && timeline.filter((m) => !m.softDeleted).length > 0}
		<Virtualizer bind:this={virtualizer} data={timeline} getKey={(k, _) => k} overscan={10}>
			{#snippet children(message: Loaded<typeof Message>, index: number)}
				{@const previousMessage = index > 0 ? timeline[index - 1] : undefined}
				{#if message && !message.softDeleted}
					<ChatMessage
						{setReplyTo}
						{message}
						{previousMessage}
						{me}
						{createThread}
						{allowThreadCreation}
						{showThread}
					/>
				{/if}
			{/snippet}
		</Virtualizer>
	{:else}
		<div class="text-base-600 dark:text-base-400 h-30 text-sm">
			No messages yet. Be the first to send a message!
		</div>
	{/if}
</div>
