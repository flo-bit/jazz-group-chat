<script lang="ts">
	import type { Loaded } from 'jazz-tools';
	import { Message, MyAppProfile } from '$lib/schema';
	import { Avatar, cn, Prose } from '@fuxui/base';
	import { CoState } from 'jazz-svelte';
	import RelativeTime from 'svelte-relative-time';

	let {
		message,
		previousMessage
	}: { message: Loaded<typeof Message>; previousMessage?: Loaded<typeof Message> } = $props();

	let profile = $derived(new CoState(MyAppProfile, message._edits.content?.by?.profile?.id));

	// if the same user and the message was created in the last minute, don't show the border, username or avatar
	let isSameUser = $derived(
		previousMessage?._edits.content?.by?.profile?.id === message._edits.content?.by?.profile?.id &&
			(message.createdAt?.getTime() ?? 0) - (previousMessage?.createdAt?.getTime() ?? 0) < 1000 * 60
	);

	$effect(() => {
		console.log(message.createdAt);
		console.log(previousMessage?.createdAt);
		console.log((message.createdAt?.getTime() ?? 0) - (previousMessage?.createdAt?.getTime() ?? 0));
	});
</script>

<div
	class={cn(
		'group relative flex w-full justify-start gap-3',
		!isSameUser ? 'border-base-200/70 dark:border-base-800/50 border-t pt-2 pb-2' : '-my-1.5'
	)}
>
	{#if !isSameUser}
		<Avatar class="size-8 sm:size-10" src={profile?.current?.imageUrl} />
	{:else}
		<div class="size-8 sm:size-10"></div>
	{/if}

	<div class="flex flex-col gap-1">
		{#if !isSameUser}
			<span class="text-accent-600 dark:text-accent-400 text-sm font-medium">
				{profile?.current?.name}
			</span>
		{/if}
		<Prose>
			{@html message.content}
		</Prose>
	</div>

	<div
		class="absolute top-0 right-1 bottom-0 flex items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
	>
		<RelativeTime
			date={message.createdAt}
			locale="en"
			class="text-base-600 dark:text-base-400 text-xs"
		/>
	</div>

</div>
