<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import TimelineView from '$lib/components/TimelineView.svelte';
	import { useCurrentRoute } from '$lib/context';
	import { LastReadList, Message, MyAppAccount, Reaction, Space, Thread } from '$lib/schema';
	import { joinSpace, publicGroup } from '$lib/utils';
	import { AccountCoState, CoState } from 'jazz-svelte';
	import { co, CoRichText, type Loaded } from 'jazz-tools';

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

	let thread = $derived(
		new CoState(Thread, route.threadId, {
			resolve: {
				timeline: {
					$each: {
						reactions: {
							$each: true
						}
					}
				}
			}
		})
	);

	afterNavigate(() => {
		setLastRead();
	});

	function setLastRead() {
		if (!route.threadId) {
			console.log('no channel id');
			return;
		}
		if (!me?.current?.root) {
			console.log('no account');
			return;
		}
		if (me?.current?.root?.lastRead) {
			me.current.root.lastRead[route.threadId] = new Date();
		} else {
			me.current.root.lastRead = LastReadList.create({
				[route.threadId]: new Date()
			});
			console.log('no last read');
		}
	}
	// svelte-ignore state_referenced_locally
	let count = $state(thread.current?.timeline?.length ?? 0);

	$effect(() => {
		let newCount = thread.current?.timeline?.length ?? 0;
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
				images: co.list(co.image()).create([...postImages], {
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

		postImages = [];

		replyTo = null;

		thread.current?.timeline?.push(message);
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

	let postImages = $state([]);
</script>

<TimelineView
	timeline={thread.current?.timeline}
	{setReplyTo}
	me={me?.current}
	createThread={() => {}}
	allowThreadCreation={false}
	showThread={false}
/>

<ChatInput
	bind:replyTo
	me={me?.current}
	{handleSubmit}
	{clickJoinSpace}
	bind:value={input}
	bind:images={postImages}
/>
