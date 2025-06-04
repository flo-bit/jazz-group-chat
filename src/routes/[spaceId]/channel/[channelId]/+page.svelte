<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import { useCurrentRoute } from '$lib/context';
	import {
		Channel,
		LastReadList,
		Message,
		MyAppAccount,
		Reaction,
		Space,
		Thread,
		Timeline
	} from '$lib/schema';
	import { createMessage, joinSpace, publicGroup } from '$lib/utils';
	import { Button, Heading, Input, Modal } from '@fuxui/base';
	import { AccountCoState, CoState } from 'jazz-svelte';
	import { co, CoRichText, z, type Loaded } from 'jazz-tools';
	import { view } from '../../view.svelte';
	import ChatMessageThread from '$lib/components/ChatMessageThread.svelte';
	import TimelineView from '$lib/components/TimelineView.svelte';
	import { onMount } from 'svelte';

	const route = useCurrentRoute();

	let space = $derived(new CoState(Space, route.spaceId));

	// onMount(() => {
	// 	setInterval(() => {
	// 		// post a new random message
	// 		input = '<p>' + Math.random().toString(36).substring(2, 15) + '</p>';
	// 		handleSubmit();
	// 	}, 1000);
	// });

	const me = new AccountCoState(MyAppAccount, {
		resolve: {
			profile: true,
			root: {
				joinedSpaces: true
			}
		}
	});

	let channel = $derived(
		new CoState(Channel, route.channelId, {
			resolve: {
				mainThread: {
					timeline: true
				},
				subThreads: true
			}
		})
	);

	afterNavigate(() => {
		setLastRead();
	});

	function setLastRead() {
		if (!route.channelId) {
			console.log('no channel id');
			return;
		}
		if (!me?.current?.root) {
			console.log('no account');
			return;
		}
		if (me?.current?.root?.lastRead) {
			me.current.root.lastRead[route.channelId] = new Date();
		} else {
			me.current.root.lastRead = LastReadList.create({
				[route.channelId]: new Date()
			});
			console.log('no last read');
		}
	}
	// svelte-ignore state_referenced_locally
	let count = $state(channel.current?.mainThread?.timeline?.length ?? 0);

	$effect(() => {
		let newCount = channel.current?.mainThread?.timeline?.length ?? 0;
		if (count < newCount) {
			count = newCount;

			setLastRead();
		}
	});

	function handleSubmit() {
		let newContent = new CoRichText({
			text: input,
			owner: publicGroup()
		});

		const message = createMessage(newContent, postImages, replyTo?.id);

		postImages = [];

		replyTo = null;

		channel.current?.mainThread?.timeline?.push(message.id);
	}

	async function clickJoinSpace() {
		console.log('clickJoinSpace', space?.current);
		let toJoinSpace = space?.current;
		if (!toJoinSpace) {
			if (!route.spaceId) {
				console.log('no space id');
				return;
			}
			toJoinSpace = await Space.load(route.spaceId);
		}

		if (!toJoinSpace) {
			console.error('space not found');
			return;
		}

		joinSpace(toJoinSpace);
		me?.current?.root?.joinedSpaces?.unshift(toJoinSpace);

		console.log('joined space', toJoinSpace, me?.current?.root?.joinedSpaces);
	}

	let input = $state('');
	let replyTo = $state<Loaded<typeof Message> | null>(null);

	function setReplyTo(message: Loaded<typeof Message>) {
		replyTo = message;
	}

	let createThreadModalOpen = $state(false);

	let threadMessage = $state<Loaded<typeof Message> | null>(null);
	let threadName = $state('');

	let postImages = $state([]);

	function createThread() {
		if (!threadMessage) {
			console.error('threadMessage is null');
			return;
		}

		const thread = Thread.create(
			{
				name: threadName || 'New Thread',
				timeline: Timeline.create([threadMessage.id], {
					owner: publicGroup()
				})
			},
			{
				owner: publicGroup()
			}
		);

		threadMessage.thread = thread.id;

		channel.current?.subThreads?.push(thread);

		createThreadModalOpen = false;
	}

	// onMount(() => {
	// 	// send a random message every second
	// 	setInterval(() => {
	// 		input = '<p>' + Math.random().toString(36).substring(2, 15) + '</p>';
	// 		handleSubmit();

	// 		// log number of messages
	// 		console.log('number of messages', channel.current?.mainThread?.timeline?.length);
	// 	}, 200);
	// });
</script>

{#if view.active === 'channel'}
	<TimelineView
		timeline={channel.current?.mainThread?.timeline}
		{setReplyTo}
		me={me?.current ?? null}
		createThread={(message) => {
			threadMessage = message;
			createThreadModalOpen = true;
		}}
	/>

	<ChatInput
		bind:replyTo
		me={me?.current}
		{handleSubmit}
		{clickJoinSpace}
		bind:value={input}
		bind:images={postImages}
	/>
{:else}
	<div class="flex w-full flex-col gap-2">
		{#each channel.current?.subThreads ?? [] as thread}
			{#if thread}
				<ChatMessageThread
					threadId={thread.id}
					indented={false}
					lastReadDate={me?.current?.root?.lastRead?.[thread.id]}
				/>
			{/if}
		{/each}
		{#if channel.current?.subThreads?.length === 0}
			<div class="text-base-600 dark:text-base-400 h-30 text-sm">
				No threads yet. Be the first to create a thread!
			</div>
		{/if}
	</div>
{/if}

<Modal bind:open={createThreadModalOpen}>
	<div class="flex flex-col gap-4">
		<Heading>create new thread</Heading>
		{#if threadMessage}
			<div class="bg-base-200/50 dark:bg-base-800/50 rounded-2xl p-2">
				<ChatMessage
					{setReplyTo}
					messageId={threadMessage.id}
					me={me?.current}
					showMenu={false}
					showReactions={false}
					showDivider={false}
					showReply={false}
				/>
			</div>
		{/if}
		<form class="flex flex-col gap-2" onsubmit={createThread}>
			<Input type="text" placeholder="Thread name" bind:value={threadName} />
			<Button type="submit">create</Button>
		</form>
	</div>
</Modal>
