<script lang="ts">
	import type { Loaded } from 'jazz-tools';
	import { Message, MyAppAccount, MyAppProfile, Reaction, Space } from '$lib/schema';
	import { Avatar, cn, Prose } from '@fuxui/base';
	import { CoState } from 'jazz-svelte';
	import RelativeTime from 'svelte-relative-time';
	import { isSpaceAdmin, publicGroup } from '$lib/utils';
	import ChatMessageMenu from './ChatMessageMenu.svelte';
	import ChatReactions from './ChatReactions.svelte';
	import ReplyMessage from './ReplyMessage.svelte';
	import ChatMessageThread from './ChatMessageThread.svelte';
	import { useCurrentRoute } from '$lib/context';

	let {
		message,
		previousMessage,
		me,
		setReplyTo,
		createThread,
		showMenu = true,
		showReactions = true,
		showDivider = true,
		showReply = true,
		showThread = true,
		allowThreadCreation = true
	}: {
		message: Loaded<typeof Message>;
		previousMessage?: Loaded<typeof Message>;
		me: Loaded<typeof MyAppAccount>;
		setReplyTo: (message: Loaded<typeof Message>) => void;
		createThread: (message: Loaded<typeof Message>) => void;
		showMenu?: boolean;
		showReactions?: boolean;
		showDivider?: boolean;
		showReply?: boolean;
		showThread?: boolean;
		allowThreadCreation?: boolean;
	} = $props();

	let profile = $derived(new CoState(MyAppProfile, message._edits.content?.by?.profile?.id));

	// if the same user and the message was created in the last minute, don't show the border, username or avatar
	let isSameUser = $derived.by(() => {
		if (!previousMessage) return false;
		if (previousMessage.softDeleted) return false;
		if (previousMessage._edits.content?.by?.profile?.id !== message._edits.content?.by?.profile?.id)
			return false;
		if (message.replyTo) return false;
		return (
			(message.createdAt?.getTime() ?? 0) - (previousMessage?.createdAt?.getTime() ?? 0) < 1000 * 60
		);
	});

	let route = useCurrentRoute();

	let canSoftDelete = $derived.by(() => {
		// is admin
		let space = new CoState(Space, route.spaceId);
		if (!space.current) return false;
		if (isSpaceAdmin(space.current)) return true;
		// if is the same user
		return message._edits.content?.by?.profile?.id === me.profile?.id;
	});

	let pickerOpen = $state(false);
	let hovering = $state(false);

	function convertReactionsToEmojis(reactions: Loaded<typeof Reaction>[]) {
		if (!reactions) return [];

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

	function softDelete() {
		message.softDeleted = true;
	}

	let reactions = $derived(convertReactionsToEmojis(message.reactions));
</script>

<div
	class={cn(
		'flex w-full max-w-full flex-col gap-2 py-1 select-text',
		!isSameUser && showDivider
			? 'border-base-200/70 dark:border-base-900/50 border-t pt-2 pb-2'
			: '-my-1.5'
	)}
>
	{#if message.replyTo && showReply}
		<ReplyMessage replyToId={message.replyTo} />
	{/if}
	<div
		class={cn('group relative flex w-full justify-start gap-3')}
		onpointerover={() => (hovering = true)}
		onpointerleave={() => (hovering = false)}
	>
		{#if !isSameUser}
			<Avatar class="size-8 sm:size-10" src={profile?.current?.imageUrl} />
		{:else}
			<div class="size-8 shrink-0 sm:size-10"></div>
		{/if}

		<div class="flex flex-col gap-1">
			{#if !isSameUser}
				<span
					class="text-accent-600 dark:text-accent-400 flex items-center gap-2 text-sm font-medium"
				>
					<span>{profile?.current?.name}</span>
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

			{#if showReactions}
				<ChatReactions {reactions} {addReaction} {removeReaction} />
			{/if}
		</div>

		{#if showMenu}
			<ChatMessageMenu
				setAsReplyTo={() => setReplyTo(message)}
				{hovering}
				open={pickerOpen}
				{reactions}
				{addReaction}
				{removeReaction}
				{allowThreadCreation}
				createThread={() => createThread(message)}
				{softDelete}
				{canSoftDelete}
			/>
		{/if}
	</div>

	{#if showThread && message.thread}
		<ChatMessageThread
			threadId={message.thread}
			lastReadDate={me?.root?.lastRead?.[message.thread]}
		/>
	{/if}
</div>
