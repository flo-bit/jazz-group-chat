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
		allowThreadCreation = true,
		softDelete,
		canSoftDelete = false
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
		softDelete: () => void;
		canSoftDelete?: boolean;
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

			{#if canSoftDelete}
				<Button variant="ghost" size="iconSm" onclick={softDelete}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
						/>
					</svg>
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
