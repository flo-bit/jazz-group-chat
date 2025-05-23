<script lang="ts">
	import { cn } from '@fuxui/base';

	let { children, hasSidebar = true, ...restProps } = $props();
</script>

<div class={cn('h-[100dvh] px-4', hasSidebar ? 'lg:ml-80' : '')} {...restProps}>
	<div class="flex w-full flex-col items-start justify-center gap-2 py-24">
		{@render children?.()}
	</div>
</div>
