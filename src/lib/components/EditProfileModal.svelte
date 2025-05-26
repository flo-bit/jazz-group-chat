<script lang="ts">
	import { MyAppAccount } from '$lib/schema';
	import { Button, Input, Modal, Paragraph, Subheading } from '@fuxui/base';
	import { AccountCoState } from 'jazz-svelte';
	import Avatar from './Avatar.svelte';
	import { createImage } from 'jazz-browser-media-images';
	import { publicGroup } from '$lib/utils';
	import { getProfile, resolveHandle } from '$lib/bluesky';

	let {
		open = $bindable(false)
	}: {
		open: boolean;
	} = $props();

	const me = new AccountCoState(MyAppAccount, {
		resolve: {
			profile: true,
			root: true
		}
	});

	let username = $derived(me.current?.profile?.name ?? '');

	// async function editProfile() {
	// 	editProfileModalOpen = false;

	// 	let did = await resolveHandle({ handle });
	// 	let profile = await getProfile({ did });

	// 	if (!me.current?.profile) return;
	// 	me.current.profile.name = profile.handle;

	// 	if (profile.avatar) {
	// 		me.current.profile.imageUrl = profile.avatar;
	// 	}
	// }

	let isProcessingImage = $state(false);

	let handle = $state('');

	async function processImageFile(file: File) {
		if (!me.current) return;
		isProcessingImage = true;
		const image = await createImage(file, {
			owner: publicGroup('reader'),
			maxSize: 1024
		});

		me.current.profile.image = image;
		isProcessingImage = false;
	}

	let loadingBlueskyInfo = $state(false);

	async function editProfile() {
		loadingBlueskyInfo = true;

		let did = await resolveHandle({ handle });
		let profile = await getProfile({ did });

		if (!me.current?.profile) return;
		me.current.profile.name = profile.handle;

		if (profile.avatar) {
			me.current.profile.imageUrl = profile.avatar;
			me.current.profile.image = undefined;
		}
		loadingBlueskyInfo = false;
	}
</script>

<Modal bind:open>
	<div class="flex flex-col gap-4">
		<Subheading>Edit your profile</Subheading>

		<div class="flex flex-col gap-2">
			<button
				onclick={() => {
					// upload new image
					// new file input
					if (!me.current) return;
					me.current.profile.imageUrl = undefined;

					const input = document.createElement('input');
					input.type = 'file';
					input.accept = 'image/*';
					input.onchange = (e) => {
						const file = (e.target as HTMLInputElement).files?.[0];
						if (!file) return;
						processImageFile(file);
					};
					input.click();
				}}
				class="w-fit cursor-pointer hover:opacity-80"
			>
				{#if isProcessingImage}
					<div class="bg-accent-500/20 size-24 animate-pulse rounded-full"></div>
				{:else}
					{#key me.current?.profile.imageUrl || me.current?.profile.image}
						<Avatar
							image={me.current?.profile?.image}
							src={me.current?.profile?.imageUrl}
							class="size-24"
						/>
					{/key}
				{/if}
			</button>
			<span class="text-base-500 text-sm">click avatar to change</span>
		</div>

		<Paragraph>Username</Paragraph>
		<Input
			bind:value={username}
			onkeydown={() => {
				if (me.current) me.current.profile.name = username;
			}}
			onblur={() => {
				if (me.current) me.current.profile.name = username;
			}}
		/>

		<div class="text-base-800 dark:text-base-200 my-4 text-sm">Or set from bluesky handle:</div>

		<form
			class="flex gap-2"
			onsubmit={() => {
				editProfile();
			}}
		>
			<Input bind:value={handle} class="grow" />
			<Button variant="secondary" type="submit" disabled={loadingBlueskyInfo}>
				{loadingBlueskyInfo ? 'Loading...' : 'Save'}
			</Button>
		</form>
	</div>
</Modal>
