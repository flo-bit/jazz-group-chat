<script lang="ts">
	let { src, alt, class: className }: { src: string; alt: string; class?: string } = $props();
</script>

<img {src} {alt} class={className} />
