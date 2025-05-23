<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import Container from '$lib/components/Container.svelte';
	import { RichTextEditor } from '$lib/components/rich-text-editor';
	import { Channel, Message, MyAppAccount, Reaction, Space } from '$lib/schema';
	import { joinSpace, publicGroup } from '$lib/utils';
	import { Button, Prose } from '@fuxui/base';
	import { AccountCoState, CoState } from 'jazz-svelte';
	import { co, CoRichText } from 'jazz-tools';
	import { onMount } from 'svelte';

	let channelId = $state(page.params.channelId);
	let spaceId = $state(page.params.spaceId);

	const me = new AccountCoState(MyAppAccount, {
		resolve: {
			profile: true,
			root: true
		}
	});

	let space = $derived(
		new CoState(Space, spaceId, {
			resolve: {
				channels: {
					$each: true,
					$onError: null
				}
			}
		})
	);

	let channel = $derived(
		new CoState(Channel, channelId, {
			resolve: {
				mainThread: {
					timeline: true
				},
				subThreads: true
			}
		})
	);

	$inspect(space.current);

	afterNavigate(() => {
		channelId = page.params.channelId;
		spaceId = page.params.spaceId;

		console.log('afterNavigate', space.current);
		console.log('afterNavigate', channel.current);
	});

	function handleSubmit() {
		console.log('input', input);
		let newContent = new CoRichText({
			text: input,
			owner: publicGroup()
		});
		console.log('newContent', newContent);
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
				type: 'message'
			},
			{
				owner: publicGroup()
			}
		);

		channel.current?.mainThread?.timeline?.push(message);

		// clear message
	}

	async function clickJoinSpace() {
		console.log('clickJoinSpace', space.current);
		let toJoinSpace = space.current;
		if (!toJoinSpace) {
			toJoinSpace = await Space.load(spaceId);
		}

		if (!toJoinSpace) {
			console.error('space not found');
			return;
		}

		joinSpace(toJoinSpace);
		me.current?.root.joinedSpaces?.unshift(toJoinSpace);

		console.log('joined space', toJoinSpace);
	}

	let input = $state('');
</script>

<div class="flex w-full flex-col gap-1">
	{#each channel.current?.mainThread?.timeline ?? [] as message, index}
		{#if message}
			<ChatMessage {message} previousMessage={channel.current?.mainThread?.timeline?.[index - 1]} />
		{/if}
	{/each}
	{#if channel.current?.mainThread?.timeline?.length === 0}
		<div class="text-base-600 dark:text-base-400 text-sm h-30">
			No messages yet. Be the first to send a message!
		</div>
	{/if}
</div>

<div
	class="dark:bg-base-900 border-base-200 dark:border-base-800 fixed right-2 bottom-0 left-2 rounded-t-2xl border-x border-t bg-white px-4 shadow-lg lg:left-76"
>
	{#if me.current?.root.joinedSpaces?.some((space) => space?.id === spaceId)}
		<Prose class="">
			<RichTextEditor
				bind:htmlContent={input}
				onEnter={handleSubmit}
				class="max-h-[30dvh] overflow-y-auto"
			/>
		</Prose>
	{:else}
		<div class="flex items-center justify-center">
			<Button class="my-2.5" onclick={clickJoinSpace}>Join Space to chat</Button>
		</div>
	{/if}
</div>
