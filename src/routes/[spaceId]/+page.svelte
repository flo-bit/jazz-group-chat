<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { Space } from '$lib/schema';
	import { Button, Heading, Paragraph, Subheading } from '@fuxui/base';
	import { CoState } from 'jazz-svelte';

	let spaceId: string = $state(page.params.spaceId);

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
			<Button
				data-current={page.url.pathname === `${base}/${spaceId}/channel/${channel.id}`}
				variant="ghost"
				href="{base}/{spaceId}/channel/{channel.id}"
				class="w-full justify-start backdrop-blur-none"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
					/>
				</svg>

				{channel.name}</Button
			>
		{/if}
	{/each}
</div>
