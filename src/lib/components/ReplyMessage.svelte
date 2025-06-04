<script lang="ts">
	import { Message, MyAppProfile } from '$lib/schema';
	import { cn, Prose } from '@fuxui/base';
	import { CoState } from 'jazz-svelte';
	import { getContext } from 'svelte';
	import { view } from '../../routes/[spaceId]/view.svelte';
	import Avatar from './Avatar.svelte';

	let {
		replyToId
	}: {
		replyToId: string;
	} = $props();

	let message = $derived(new CoState(Message, replyToId));
	let profile = $derived(
		new CoState(MyAppProfile, message.current?._edits.content?.by?.profile?.id)
	);

	let scrollTo = getContext('scrollTo') as (id: string | undefined) => void;
</script>

{#if message.current}
	<div
		class={cn(
			'group isolate bg-base-200/50 pointer-events-none dark:bg-base-900/40 border-base-300/50 dark:border-base-800/30 text-base-700 dark:text-base-300',
			'relative inline-flex w-full max-w-full min-w-0 items-center justify-start gap-3 overflow-x-hidden rounded-2xl border px-3 py-0.5 text-xs'
		)}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="2"
			stroke="currentColor"
			class="size-3.5 z-10"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
			/>
		</svg>

		{#if profile?.current?.imageUrl}
			<Avatar class="size-4 z-10" src={profile?.current?.imageUrl} image={profile?.current?.image} />
		{/if}

		<span
			class="text-accent-600 dark:text-accent-400 shrink-0 font-medium z-10"
		>
			{profile?.current?.name}</span
		>

		{#if message.current.softDeleted}
			<span class="text-base-600 dark:text-base-400 py-1 z-10">Message deleted</span>
		{:else}
			<Prose class="truncate z-10 line-clamp-1">
				{@html message.current?.content}
			</Prose>
		{/if}

		<button
			class={cn(
				'absolute inset-0 h-full w-full cursor-pointer pointer-events-auto',
				'group-hover:bg-base-300/20 dark:group-hover:bg-base-700/10 transition-colors duration-300'
			)}
			onclick={() => {
				view.highlightedMessage = message.current?.id
				scrollTo(message.current?.id);
			}}
		>
			<span class="sr-only">jump to reply</span>
		</button>
	</div>
{/if}
