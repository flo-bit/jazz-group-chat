<script lang="ts">
	import { Avatar as AvatarPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import { cn } from '@fuxui/base';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Loaded } from 'jazz-tools';
	import { type Image as ImageType } from '$lib/schema';
	import Image from './Image.svelte';
	import { browser } from '$app/environment';

	let {
		src,
		alt,
		fallback,
		ref = $bindable(null),

		image,

		imageRef = $bindable(null),
		imageClass,

		fallbackRef = $bindable(null),
		fallbackClass,

		class: className,
		...restProps
	}: WithoutChildrenOrChild<HTMLAttributes<HTMLDivElement>> & {
		fallback?: string;
		imageRef?: HTMLImageElement | null;
		imageClass?: string;
		fallbackRef?: HTMLElement | null;
		fallbackClass?: string;

		image?: Loaded<typeof ImageType>;

		src?: string;
		alt?: string;

		useThemeColor?: boolean;
	} = $props();
</script>

<div
	class={cn(
		'border-base-300 bg-base-200 text-base-900 dark:border-base-800 dark:bg-base-900 dark:text-base-50 relative isolate flex size-10 shrink-0 overflow-hidden rounded-full border',
		className
	)}
	{...restProps}
	bind:this={ref}
>
	{#if fallback}
		<span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-medium"
			>{fallback}</span
		>
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			class="text-base-400 dark:text-base-600 absolute top-1/2 left-1/2 mt-[15%] size-full -translate-x-1/2 -translate-y-1/2"
		>
			<path
				fill-rule="evenodd"
				d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
				clip-rule="evenodd"
			/>
		</svg>
	{/if}
	{#if (src || image) && browser}
		<Image
			{src}
			{image}
			class="z-10 aspect-square size-full object-cover"
		/>
	{/if}
</div>
