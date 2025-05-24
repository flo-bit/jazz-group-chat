<script lang="ts">
	import { Message, Reaction } from '$lib/schema';
	import { publicGroup } from '$lib/utils';
	import { Toggle } from '@fuxui/base';
	import type { Loaded } from 'jazz-tools';

	let {
		reactions,
		addReaction,
		removeReaction,
	}: {
		reactions: {
			emoji: string;
			count: number;
			user: boolean;
		}[];
		addReaction: (emoji: string) => void;
		removeReaction: (emoji: string) => void;
	} = $props();
</script>

{#if reactions.length > 0}
	<div class="flex flex-wrap gap-1 pb-2">
		{#each reactions as reaction}
			<Toggle
				bind:pressed={
					() => {
						return reaction.user;
					},
					(pressed) => {
						if (pressed) {
							addReaction(reaction.emoji);
						} else {
							removeReaction(reaction.emoji);
						}
					}
				}
				class="text-base-600 dark:text-base-400 text-sm"
				size="sm"
			>
				{reaction.emoji}
				{#if reaction.count > 1}
					<span class="text-xs">
						{reaction.count}
					</span>
				{/if}
			</Toggle>
		{/each}
	</div>
{/if}
