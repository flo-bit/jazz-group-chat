<script lang="ts">
	import { Message, MyAppProfile } from '$lib/schema';
	import { Avatar, cn, Prose } from '@fuxui/base';
	import { CoState } from 'jazz-svelte';

	let {
		replyToId
	}: {
		replyToId: string;
	} = $props();

	let message = $derived(new CoState(Message, replyToId));
	let profile = $derived(
		new CoState(MyAppProfile, message.current?._edits.content?.by?.profile?.id)
	);
</script>

{#if message.current}
	<div class={cn('group relative inline-flex w-full max-w-full overflow-x-hidden min-w-0 justify-start gap-3 bg-base-200/50 dark:bg-base-900/40 border border-base-300/50 dark:border-base-800/30 items-center text-xs rounded-2xl text-base-700 dark:text-base-300 px-3 py-0.5')}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-3.5">
			<path stroke-linecap="round" stroke-linejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
		  </svg>

		{#if profile?.current?.imageUrl}
			<Avatar class="size-4" src={profile?.current?.imageUrl} />
		{/if}

		<span class="text-accent-600 dark:text-accent-400 shrink-0 font-medium">
			{profile?.current?.name}</span
		>

		<Prose class="truncate">
			{@html message.current?.content}
		</Prose>
	</div>
{/if}
