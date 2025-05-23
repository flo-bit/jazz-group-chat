<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import ChannelButton from '$lib/components/ChannelButton.svelte';
	import { MyAppAccount, Space } from '$lib/schema';
	import { Button, Heading, Paragraph, Subheading } from '@fuxui/base';
	import { AccountCoState, CoState } from 'jazz-svelte';

	let spaceId: string = $state(page.params.spaceId);

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

	afterNavigate(() => {
		spaceId = page.params.spaceId;
	});
</script>

<Heading
	>
	{#if space.current?.emoji}
		<span class="text-5xl mr-1">{space.current?.emoji}</span>
	{/if}
	<span class="text-base-900 dark:text-base-100 font-bold">{space.current?.name}</span>
</Heading>

{#if space.current?.description}
	<Subheading class="mt-4 mb-2">About</Subheading>
	<Paragraph class="text-sm font-normal">{space.current?.description}</Paragraph>
{/if}

<Subheading class="mt-4 mb-2">Channels</Subheading>

<div class="flex flex-col items-start justify-start gap-2">
	{#each space.current?.channels ?? [] as channel}
		{#if channel}
			<ChannelButton channel={channel} spaceId={spaceId} lastReadDate={me.current?.root.lastRead?.[channel.id]} />
		{/if}
	{/each}
</div>
