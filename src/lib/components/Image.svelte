<script lang="ts">
	import { ImageDefinition, type Loaded } from 'jazz-tools';
	import { type Image } from '$lib/schema';
	import { onMount } from 'svelte';

	let {
		image,
		src,
		class: className,
		...rest
	}: { image?: Loaded<typeof Image>; src?: string; class?: string } = $props();

	onMount(() => {});

	let loaded = $state(false);

	$effect(() => {
		if (loaded) return;
		if (!imageRef) return;
		if (src && !image) {
			imageRef.src = src;
			loaded = true;
			return;
		}
		if (!image) return;

		loaded = true;
		const highestRes = ImageDefinition.highestResAvailable(image);

		if (!highestRes) return;
		
		const blob = highestRes.stream.toBlob();

		if (!blob) return;

		const url = URL.createObjectURL(blob);
		imageRef.src = url;
		imageRef.onload = () => URL.revokeObjectURL(url);
	});

	let imageRef = $state<HTMLImageElement | null>(null);
</script>

<img class={className} bind:this={imageRef} {...rest} />
