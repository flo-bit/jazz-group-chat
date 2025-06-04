<script lang="ts">
	import { ImageDefinition, type Loaded } from 'jazz-tools';
	import { type Image } from '$lib/schema';
	import { onMount } from 'svelte';
	import { cn } from '@fuxui/base';
	import { CoState } from 'jazz-svelte';

	let {
		image,
		src,
		class: className,
		...rest
	}: { image?: string; src?: string; class?: string } = $props();


	let loadedImage = $derived(new CoState(ImageDefinition, image));

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

		if (!loadedImage.current?.subscribe) {
			if (loadedImage.current?.placeholderDataURL) {
				imageRef.src = loadedImage.current?.placeholderDataURL;
			}
			return;
		}

		unsub = loadedImage.current?.subscribe({}, (update) => {
			if (!imageRef) return;

			const highestRes = ImageDefinition.highestResAvailable(update);
			if (!highestRes) {
				imageRef.src = loadedImage.current?.placeholderDataURL ?? '';
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
	style="aspect-ratio: {loadedImage.current?.originalSize[0] ?? 1} / {loadedImage.current?.originalSize[1] ?? 1}"
>
	<img bind:this={imageRef} {...rest} class="absolute inset-0 object-cover w-full h-full" />
</div>
