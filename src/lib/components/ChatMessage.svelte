<script lang="ts">
	import type { Loaded } from 'jazz-tools';
	import { Message, MyAppAccount, MyAppProfile, Reaction } from '$lib/schema';
	import { Avatar, Button, cn, Prose, Toggle } from '@fuxui/base';
	import { CoState } from 'jazz-svelte';
	import RelativeTime from 'svelte-relative-time';
	import { PopoverEmojiPicker } from '@fuxui/social';
	import { publicGroup } from '$lib/utils';

	let {
		message,
		previousMessage,
		me
	}: {
		message: Loaded<typeof Message>;
		previousMessage?: Loaded<typeof Message>;
		me: Loaded<typeof MyAppAccount>;
	} = $props();

	let profile = $derived(new CoState(MyAppProfile, message._edits.content?.by?.profile?.id));

	// if the same user and the message was created in the last minute, don't show the border, username or avatar
	let isSameUser = $derived(
		previousMessage?._edits.content?.by?.profile?.id === message._edits.content?.by?.profile?.id &&
			(message.createdAt?.getTime() ?? 0) - (previousMessage?.createdAt?.getTime() ?? 0) < 1000 * 60
	);

	let pickerOpen = $state(false);
	let hovering = $state(false);

	function convertReactionsToEmojis(reactions: Loaded<typeof Reaction>[]) {
		if (!reactions) return [];

		console.log(reactions);
		// convert to [emoji, count, user (if current user has reacted with that emoji)]
		const emojiMap = new Map<string, { count: number; user: boolean }>();
		for (const reaction of reactions) {
			if (!reaction || !reaction.emoji) continue;
			let emoji = reaction.emoji;
			let obj = emojiMap.get(emoji);
			if (obj) {
				obj.count++;
			} else {
				obj = { count: 1, user: false };
				emojiMap.set(emoji, obj);
			}

			if (reaction._edits.emoji?.by?.profile?.id === me.profile?.id) {
				obj.user = true;
			}
		}
		let array = Array.from(emojiMap.entries()).map(([emoji, obj]) => ({
			emoji,
			count: obj.count,
			user: obj.user
		}));
		console.log(array);
		return array;
	}

	function removeReaction(emoji: string) {
		let index = message.reactions?.findIndex(
			(reaction) =>
				reaction?.emoji === emoji && reaction?._edits.emoji?.by?.profile?.id === me.profile?.id
		);
		if (index === undefined || index < 0) return;
		message.reactions?.splice(index, 1);
	}

	function addReaction(emoji: string) {
		message.reactions?.push(
			Reaction.create(
				{
					emoji: emoji
				},
				{
					owner: publicGroup()
				}
			)
		);
	}

	let reactions = $derived(convertReactionsToEmojis(message.reactions));
</script>

<div
	class={cn(
		'group relative flex w-full justify-start gap-3',
		!isSameUser ? 'border-base-200/70 dark:border-base-800/50 border-t pt-2 pb-2' : '-my-1.5'
	)}
	onpointerover={() => (hovering = true)}
	onpointerleave={() => (hovering = false)}
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
				<RelativeTime
					date={message.createdAt}
					locale="en"
					class="text-base-600 dark:text-base-400 text-xs"
				/>
			</span>
		{/if}
		<Prose>
			{@html message.content}
		</Prose>

		{#if reactions.length > 0}
			<div class="flex flex-wrap gap-1 pb-1">
				{#each reactions as reaction}
					<Toggle
						bind:pressed={
							() => {
								return reaction.user;
							},
							(pressed) => {
								if (pressed) {
									message.reactions?.push(
										Reaction.create(
											{
												emoji: reaction.emoji
											},
											{ owner: publicGroup() }
										)
									);
								} else {
									removeReaction(reaction.emoji);
								}
							}
						}
						class="text-base-600 dark:text-base-400 text-sm"
						size="sm"
					>
						{reaction.emoji}
						{#if reaction.count > 1}
							<span class="text-xs">
								{reaction.count}
							</span>
						{/if}
					</Toggle>
				{/each}
			</div>
		{/if}
	</div>

	{#if hovering || pickerOpen}
		<div class={cn('absolute -top-3 right-0 transition-opacity duration-200')}>
			<div
				class="bg-base-200 dark:bg-base-900 border-base-300 dark:border-base-800 rounded-2xl border p-2"
			>
				<PopoverEmojiPicker
					onpicked={(emoji) => {
						console.log(emoji);
						pickerOpen = false;

						if (reactions.find((r) => r.emoji === emoji.unicode)?.user) {
							removeReaction(emoji.unicode);
						} else {
							addReaction(emoji.unicode);
						}
					}}
					bind:open={pickerOpen}
				>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
								/>
							</svg>
						</Button>
					{/snippet}
				</PopoverEmojiPicker>
			</div>
		</div>
	{/if}
</div>
