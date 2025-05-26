<script lang="ts">
	import { base } from '$app/paths';
	import type { MyAppAccount, Space } from '$lib/schema';
	import type { Loaded } from 'jazz-tools';

	let { space, me }: { space: Loaded<typeof Space>; me: Loaded<typeof MyAppAccount> } = $props();

	function onclick() {
		return;
		let index = me.root?.joinedSpaces?.indexOf(space);
		if (index === undefined || index <= 0) return;
		// move space to the top of the list
		me.root?.joinedSpaces?.splice(index, 1);
		me.root?.joinedSpaces?.unshift(space);
	}
</script>

<li
	class="bg-base-100 dark:bg-base-900/20 hover:bg-base-200/50 dark:hover:bg-base-900/50 border-base-300/50 dark:border-base-800/50 group relative size-30 shrink-0 rounded-2xl border px-2 py-2 overflow-hidden"
>
	<a href={`/${space.id}`} class="text-base-900 dark:text-base-100 font-bold w-full flex flex-col justify-center h-full" {onclick}>
		<div class="mb-1 w-fit text-4xl">{space.emoji || '😀'}</div>
		<span class="absolute inset-x-0 -top-px bottom-0"></span>
		<span class="truncate w-full min-w-0">
			{space.name}
		</span>
	</a>
</li>
