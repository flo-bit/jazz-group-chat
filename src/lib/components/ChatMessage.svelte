<script lang="ts">
	import { ImageDefinition, type Loaded } from 'jazz-tools';
	import { Message, MyAppAccount, MyAppProfile, Reaction, Space } from '$lib/schema';
	import { cn, Prose } from '@fuxui/base';
	import { CoState } from 'jazz-svelte';
	import RelativeTime from 'svelte-relative-time';
	import { isSpaceAdmin, publicGroup } from '$lib/utils';
	import ChatMessageMenu from './ChatMessageMenu.svelte';
	import ChatReactions from './ChatReactions.svelte';
	import ReplyMessage from './ReplyMessage.svelte';
	import ChatMessageThread from './ChatMessageThread.svelte';
	import { useCurrentRoute } from '$lib/context';
	import { view } from '../../routes/[spaceId]/view.svelte';
	import Image from './Image.svelte';
	import Avatar from './Avatar.svelte';

	let {
		messageId,
		previousMessageId,
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
		messageId: string;
		previousMessageId?: string;
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

	let message = $derived(
		new CoState(Message, messageId, {
			resolve: {
				content: true,
				images: true,
				reactions: true
			}
		})
	);
	let previousMessage = $derived(new CoState(Message, previousMessageId));

	let profile = $derived(
		new CoState(MyAppProfile, message.current?._edits.content?.by?.profile?.id, {
			resolve: {
				image: true
			}
		})
	);

	// if the same user and the message was created in the last minute, don't show the border, username or avatar
	let isSameUser = $derived.by(() => {
		if (!previousMessage) return false;
		if (previousMessage.current?.softDeleted) return false;
		if (
			previousMessage.current?._edits.content?.by?.profile?.id !==
			message.current?._edits.content?.by?.profile?.id
		)
			return false;
		if (message.current?.replyTo) return false;
		return (
			(message.current?.createdAt?.getTime() ?? 0) -
				(previousMessage?.current?.createdAt?.getTime() ?? 0) <
			1000 * 60
		);
	});

	let route = useCurrentRoute();

	let canSoftDelete = $derived.by(() => {
		// is admin
		let space = new CoState(Space, route.spaceId);
		if (!space.current) return false;
		if (isSpaceAdmin(space.current)) return true;
		// if is the same user
		return message.current?._edits.content?.by?.profile?.id === me.profile?.id;
	});

	let pickerOpen = $state(false);
	let hovering = $state(false);

	function convertReactionsToEmojis(reactions: Loaded<typeof Reaction>[] | null | undefined) {
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
		let index = message.current?.reactions?.findIndex(
			(reaction) =>
				reaction?.emoji === emoji && reaction?._edits.emoji?.by?.profile?.id === me.profile?.id
		);
		if (index === undefined || index < 0) return;
		message.current?.reactions?.splice(index, 1);
	}

	function addReaction(emoji: string) {
		message.current?.reactions?.push(
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
		if (!message.current) return;
		message.current.softDeleted = true;
	}

	let reactions = $derived(convertReactionsToEmojis(message.current?.reactions));
</script>

<div
	class={cn(
		'relative flex w-full max-w-full flex-col gap-2 py-1 select-text',
		(!isSameUser || !message.current) && showDivider
			? 'border-base-200/70 dark:border-base-900/50 border-t pt-2 pb-2'
			: '-my-1.5'
	)}
>
	{#if message.current?.replyTo && showReply}
		<ReplyMessage replyToId={message.current?.replyTo} />
	{/if}

	{#if view.highlightedMessage === message.current?.id}
		<div
			class="bg-accent-500/10 dark:bg-accent-500/5 absolute top-1 -right-1 bottom-2 -left-1 rounded-2xl"
		></div>
	{/if}

	<div
		class={cn('group relative flex w-full justify-start gap-3')}
		onpointerover={() => (hovering = true)}
		onpointerleave={() => (hovering = false)}
	>
		{#if !isSameUser || !message.current}
			<Avatar
				class="size-8 sm:size-10"
				src={profile?.current?.imageUrl}
				image={profile?.current?.image}
			/>
		{:else}
			<div class="size-8 shrink-0 sm:size-10"></div>
		{/if}

		<div class="flex flex-col gap-1">
			{#if !isSameUser || !message.current}
				<span
					class="text-accent-600 dark:text-accent-400 flex items-center gap-2 text-sm font-medium"
				>
					<span>{profile?.current?.name ?? 'Loading...'}</span>
					{#if message.current?.createdAt}
						<RelativeTime
							date={message.current?.createdAt}
							locale="en"
							class="text-base-600 dark:text-base-400 text-xs"
						/>
					{/if}
				</span>
			{/if}
			<Prose>
				{@html message.current?.content ?? 'Loading...'}
			</Prose>

			{#if showReactions}
				<ChatReactions {reactions} {addReaction} {removeReaction} />
			{/if}
		</div>

		{#if showMenu}
			<ChatMessageMenu
				setAsReplyTo={() => setReplyTo(message.current)}
				{hovering}
				open={pickerOpen}
				{reactions}
				{addReaction}
				{removeReaction}
				{allowThreadCreation}
				createThread={() => createThread(message.current)}
				{softDelete}
				{canSoftDelete}
			/>
		{/if}
	</div>

	{#if message.current?.images && message.current?.images.length > 0}
		<div class="mb-4 ml-12 flex flex-wrap gap-2">
			{#each message.current?.images as image}
				<Image
					{image}
					class="border-base-200/70 dark:border-base-900/50 max-h-36 w-full max-w-36 rounded-2xl border object-contain"
				/>
			{/each}
		</div>
	{/if}
	{#if showThread && message.current?.thread}
		<ChatMessageThread
			threadId={message.current?.thread}
			lastReadDate={me?.root?.lastRead?.[message.current?.thread]}
		/>
	{/if}
</div>
