<script lang="ts">
	import { Button, cn } from '@fuxui/base';
	import { PopoverEmojiPicker } from '@fuxui/social';

	let {
		hovering,
		open = $bindable(false),
		reactions,
		addReaction,
		removeReaction,
		setAsReplyTo,
		createThread,
		allowThreadCreation = true
	}: {
		hovering: boolean;
		open: boolean;
		reactions: {
			emoji: string;
			count: number;
			user: boolean;
		}[];
		addReaction: (emoji: string) => void;
		removeReaction: (emoji: string) => void;
		setAsReplyTo: () => void;
		createThread: () => void;
		allowThreadCreation?: boolean;
	} = $props();
</script>

{#if hovering || open}
	<div class={cn('absolute -top-3 right-0')}>
		<div
			class="bg-base-200/50 dark:bg-base-900/50 border-base-300 dark:border-base-800 flex gap-2 rounded-2xl border p-1 backdrop-blur-sm"
		>
			<Button variant="ghost" size="iconSm" onclick={setAsReplyTo}
				><svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
					/>
				</svg>
			</Button>

			{#if allowThreadCreation}
				<Button variant="ghost" size="iconSm" onclick={createThread}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
						><path
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M4.5 7.5h12c1.886 0 2.828 0 3.414.586s.586 1.528.586 3.414v1m-4-2h-12m12 3h-12m12 3h-12m11 3h-10a2 2 0 0 0-2 2h14a2 2 0 0 0-2-2m-10-15h10a2 2 0 0 0 2-2h-14a2 2 0 0 0 2 2"
							color="currentColor"
						/></svg
					>
				</Button>
			{/if}

			<PopoverEmojiPicker
				onpicked={(emoji) => {
					open = false;

					if (reactions.find((r) => r.emoji === emoji.unicode)?.user) {
						removeReaction(emoji.unicode);
					} else {
						addReaction(emoji.unicode);
					}
				}}
				bind:open
			>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="iconSm">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
							class="size-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
							/>
						</svg>
					</Button>
				{/snippet}
			</PopoverEmojiPicker>
		</div>
	</div>
{/if}
