<script lang="ts">
	import { Modal, Subheading, Textarea, Input, Button, Checkbox, Label, Heading } from '@fuxui/base';
	import { PopoverEmojiPicker } from '@fuxui/social';

	let {
		open = $bindable(false),
		createNewSpace
	}: {
		open: boolean;
		createNewSpace: (space: { name: string; description: string; emoji: string, isPublic: boolean }) => void;
	} = $props();

	let spaceName = $state('');
	let spaceDescription = $state('');
	let spaceEmoji = $state('😍');

	let pickerOpen = $state(false);
	let isPublic = $state(false);
</script>

<Modal bind:open>
	<form onsubmit={() => {
		createNewSpace({
			name: spaceName,
			description: spaceDescription,
			emoji: spaceEmoji,
			isPublic
		});
		open = false;
	}} class="flex flex-col gap-4">
		<Heading>Create a Space</Heading>
		<div class="flex items-center gap-2">
			<PopoverEmojiPicker
				onpicked={(emoji) => {
					spaceEmoji = emoji.unicode;
					pickerOpen = false;
				}}
				bind:open={pickerOpen}
			>
				{#snippet child({ props })}
					<Button {...props} class="py-1 text-xl" size="icon">{spaceEmoji}</Button>
				{/snippet}
			</PopoverEmojiPicker>
			<Input bind:value={spaceName} placeholder="space name" class="w-full" />
		</div>
		<Textarea bind:value={spaceDescription} placeholder="space description" />

		<div class="flex items-center gap-2">
			<Checkbox bind:checked={isPublic} id="public" />
			<Label for="public">Show in public spaces</Label>
		</div>
		<Button type="submit">create</Button>
	</form>
</Modal>
