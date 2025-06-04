<script lang="ts">
	import { ImageDefinition, type Loaded } from 'jazz-tools';
	import { type Image } from '$lib/schema';
	import { onMount } from 'svelte';
	import { cn } from '@fuxui/base';

	let {
		image,
		src,
		class: className,
		...rest
	}: { image?: Loaded<typeof Image>; src?: string; class?: string } = $props();

	onMount(() => {});

	let loaded = $state(false);

	let unsub: (() => void) | undefined = $state(undefined);

	$effect(() => {
		if (loaded) return;
		if (!imageRef) return;

		if (src && !image) {
			imageRef.src = src;
			loaded = true;
			return;
		}

		if (!image) return;

		if (!image.subscribe) {
			if (image.placeholderDataURL) {
				imageRef.src = image.placeholderDataURL;
			}
			return;
		}

		unsub = image.subscribe({}, (update) => {
			if (!imageRef) return;

			const highestRes = ImageDefinition.highestResAvailable(update);
			if (!highestRes) {
				imageRef.src = image.placeholderDataURL ?? '';
				return;
			}

			const blob = highestRes.stream.toBlob();
			if (!blob) return;
			const blobURI = URL.createObjectURL(blob);

			imageRef.src = blobURI;
			//imageRef.onload = () => URL.revokeObjectURL(blobURI);
		});

		loaded = true;
	});

	let imageRef = $state<HTMLImageElement | null>(null);
</script>

<div
	class={cn('relative', className)}
	style="aspect-ratio: {image?.originalSize[0] ?? 1} / {image?.originalSize[1] ?? 1}"
>
	<img bind:this={imageRef} {...rest} class="absolute inset-0 object-cover w-full h-full" />
</div>
