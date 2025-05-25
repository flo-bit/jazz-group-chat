<script lang="ts">
	import { Button, Prose } from '@fuxui/base';
	import { RichTextEditor } from './rich-text-editor';
	import { type Loaded } from 'jazz-tools';
	import { MyAppProfile, type Message, type MyAppAccount, type ImageList } from '$lib/schema';
	import { CoState } from 'jazz-svelte';
	import { useCurrentRoute } from '$lib/context';
	import Image from './Image.svelte';
	import { createImage } from 'jazz-browser-media-images';
	import { publicGroup } from '$lib/utils';

	const route = useCurrentRoute();

	let {
		value = $bindable(''),
		handleSubmit,
		me,
		clickJoinSpace,
		replyTo = $bindable(null),
		images = $bindable([])
	}: {
		value: string;
		handleSubmit: () => void;
		me: Loaded<typeof MyAppAccount>;
		clickJoinSpace: () => void;
		replyTo: Loaded<typeof Message> | null;
		images: Loaded<typeof ImageList>;
	} = $props();

	let profile = $derived(new CoState(MyAppProfile, replyTo?._edits.content?.by?.profile?.id));

	let processingImage = $state(false);

	async function processImageFile(file: File) {
		if (!images) return;
		processingImage = true;
		const image = await createImage(file, {
			owner: publicGroup(),
			maxSize: 1024
		});

		images.push(image);
		processingImage = false;
	}
</script>

<div
	class="dark:bg-base-900 border-base-200 dark:border-base-800 fixed right-2 bottom-0 left-2 z-20 rounded-t-2xl border-x border-t bg-white px-1 shadow-lg lg:left-76"
>
	{#if me?.root?.joinedSpaces?.some((space) => space?.id === route.spaceId)}
		{#if replyTo}
			<div
				class="text-base-600 dark:text-base-400 bg-base-100 dark:bg-base-800 relative mt-1 flex items-center justify-between gap-1 rounded-2xl px-3 py-1 text-xs"
			>
				<div class="flex items-center gap-1 font-medium">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="mr-1 size-3"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
						/>
					</svg>

					replying to
					<span class="text-accent-600 dark:text-accent-400">
						{profile?.current?.name}
					</span>
				</div>

				<Button variant="link" size="iconSm" onclick={() => (replyTo = null)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-4"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</Button>
			</div>
		{/if}

		{#if images && images.length > 0}
			<div class="flex gap-2 px-2 pt-2 [&_img]:size-24 [&_img]:rounded-2xl">
				{#each images as image}
					<div class="relative">
						<Image {image} class="size-24 rounded-2xl object-cover" />
						<Button
							size="iconSm"
							variant="ghost"
							class="absolute top-0 right-0"
							onclick={() => {
								images = images.filter((i) => i?.id !== image?.id);
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-4"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>
						</Button>
					</div>
				{/each}
			</div>
		{/if}
		{#if processingImage}
			<div class="text-xs text-base-600 dark:text-base-400 px-2 pt-2">
				Processing image...
			</div>
		{/if}

		<Prose class="px-2" size="md">
			<RichTextEditor
				bind:htmlContent={value}
				onEnter={handleSubmit}
				class="max-h-[30dvh] overflow-y-auto w-full"
				{processImageFile}
			/>
		</Prose>
	{:else}
		<div class="flex items-center justify-center">
			<Button class="my-2.5" onclick={clickJoinSpace}>Join Space to chat</Button>
		</div>
	{/if}
</div>
