<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import TimelineView from '$lib/components/TimelineView.svelte';
	import { useCurrentRoute } from '$lib/context';
	import { LastReadList, Message, MyAppAccount, Reaction, Space, Thread } from '$lib/schema';
	import { createMessage, joinSpace, publicGroup } from '$lib/utils';
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
				timeline: true
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

	function handleSubmit() {
		let newContent = new CoRichText({
			text: input,
			owner: publicGroup()
		});

		let images: string[] = [];

		if(postImages.length > 0) {
			postImages.forEach(image => {
				images.push(image.id);
			});
		}

		// add message to channel
		const message = createMessage(newContent, images, replyTo?.id);

		postImages = [];

		replyTo = null;

		thread.current?.timeline?.push(message.id);
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


	let timeline = $derived(
		Object.values(thread.current?.timeline.perAccount ?? {})
			.map((accountFeed) => new Array(...accountFeed.all))
			.flat()
			.sort((a, b) => a.madeAt.getTime() - b.madeAt.getTime())
			.map((a) => a.value)
	);


	// svelte-ignore state_referenced_locally
	let count = $state(timeline.length ?? 0);

	$effect(() => {
		let newCount = timeline.length ?? 0;
		if (count < newCount) {
			count = newCount;

			setLastRead();
		}
	});
</script>

<TimelineView
	{timeline}
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
