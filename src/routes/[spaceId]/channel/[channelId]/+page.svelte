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
		Thread
	} from '$lib/schema';
	import { joinSpace, publicGroup } from '$lib/utils';
	import { Button, Heading, Input, Modal } from '@fuxui/base';
	import { AccountCoState, CoState } from 'jazz-svelte';
	import { co, CoRichText, type Loaded } from 'jazz-tools';
	import { view } from '../../view.svelte';
	import ChatMessageThread from '$lib/components/ChatMessageThread.svelte';
	import TimelineView from '$lib/components/TimelineView.svelte';

	const route = useCurrentRoute();

	let space = $derived(
		new CoState(Space, route.spaceId, {
			resolve: {
				channels: {
					$each: true,
					$onError: null
				}
			}
		})
	);

	const me = new AccountCoState(MyAppAccount, {
		resolve: {
			profile: true,
			root: true
		}
	});

	let channel = $derived(
		new CoState(Channel, route.channelId, {
			resolve: {
				mainThread: {
					timeline: {
						$each: {
							reactions: {
								$each: true
							}
						}
					}
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

		// add message to channel
		const message = Message.create(
			{
				content: newContent,
				createdAt: new Date(),
				updatedAt: new Date(),
				images: co.list(co.image()).create([], {
					owner: publicGroup()
				}),
				reactions: co.list(Reaction).create([], {
					owner: publicGroup()
				}),
				replyTo: replyTo?.id,
				type: 'message'
			},
			{
				owner: publicGroup()
			}
		);

		replyTo = null;

		channel.current?.mainThread?.timeline?.push(message);
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

		console.log('joined space', toJoinSpace);
	}

	let input = $state('');
	let replyTo = $state<Loaded<typeof Message> | null>(null);

	function setReplyTo(message: Loaded<typeof Message>) {
		replyTo = message;
	}

	let createThreadModalOpen = $state(false);

	let threadMessage = $state<Loaded<typeof Message> | null>(null);
	let threadName = $state('');

	function createThread() {
		if (!threadMessage) {
			console.error('threadMessage is null');
			return;
		}

		const thread = Thread.create(
			{
				name: threadName || 'Unnamed Thread',
				timeline: co.list(Message).create([threadMessage], {
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
</script>

{#if view.active === 'channel'}
	<TimelineView
		timeline={channel.current?.mainThread?.timeline}
		setReplyTo={setReplyTo}
		me={me?.current}
		createThread={(message) => {
			threadMessage = message;
			createThreadModalOpen = true;
		}}
	/>

	<ChatInput bind:replyTo me={me?.current} {handleSubmit} {clickJoinSpace} bind:value={input} />
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
					message={threadMessage}
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
