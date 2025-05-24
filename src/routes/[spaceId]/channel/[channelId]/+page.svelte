<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import Container from '$lib/components/Container.svelte';
	import { RichTextEditor } from '$lib/components/rich-text-editor';
	import { useMe, useSpace, useSpaceId } from '$lib/context';
	import { Channel, LastReadList, Message, MyAppAccount, Reaction, Space } from '$lib/schema';
	import { joinSpace, publicGroup } from '$lib/utils';
	import { Button, Prose } from '@fuxui/base';
	import { AccountCoState, CoState } from 'jazz-svelte';
	import { co, CoRichText, type Loaded } from 'jazz-tools';
	import { onMount } from 'svelte';

	let channelId = $state(page.params.channelId);

	const me = useMe();
	const space = useSpace();
	const spaceId = useSpaceId();

	let channel = $derived(
		new CoState(Channel, channelId, {
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
		channelId = page.params.channelId;

		setLastRead();
	});


	function setLastRead() {
		if(!me?.current?.root) {
			console.log('no account');
			return;
		}
		if (me?.current?.root?.lastRead) {
			me.current.root.lastRead[channelId] = new Date();
		} else {
			me.current.root.lastRead = LastReadList.create({
				[channelId]: new Date()
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
			toJoinSpace = await Space.load(spaceId);
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
</script>

<div class="flex w-full flex-col gap-1">
	{#each channel.current?.mainThread?.timeline ?? [] as message, index}
		{#if message}
			<ChatMessage setReplyTo={setReplyTo} {message} previousMessage={channel.current?.mainThread?.timeline?.[index - 1]} me={me?.current} />
		{/if}
	{/each}
	{#if channel.current?.mainThread?.timeline?.length === 0}
		<div class="text-base-600 dark:text-base-400 text-sm h-30">
			No messages yet. Be the first to send a message!
		</div>
	{/if}
</div>


<ChatInput
	bind:replyTo
	spaceId={spaceId}
	me={me.current}
	handleSubmit={handleSubmit}
	clickJoinSpace={clickJoinSpace}
	bind:value={input}
/>