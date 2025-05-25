<script lang="ts">
	import { Avatar, Button, cn, Heading, Input, Modal, Subheading, ThemeToggle } from '@fuxui/base';
	import { AccountCoState, CoState } from 'jazz-svelte';
	import { LastReadList, MyAppAccount, SpaceList } from '$lib/schema';
	import { createSpace } from '$lib/utils';
	import { getProfile, resolveHandle } from '$lib/bluesky';
	import { ImageDefinition } from 'jazz-tools';
	import { onDestroy } from 'svelte';
	import SpaceItem from '$lib/components/SpaceItem.svelte';
	import CreateSpaceModal from '$lib/components/CreateSpaceModal.svelte';
	import SpaceSelection from '$lib/SpaceSelection.svelte';

	const me = new AccountCoState(MyAppAccount, {
		resolve: {
			profile: true,
			root: true
		}
	});

	function createNewSpace({
		name,
		description,
		emoji,
		isPublic
	}: {
		name: string;
		description: string;
		emoji: string;
		isPublic: boolean;
	}) {
		let space = createSpace(name, description, emoji);

		me.current?.root.joinedSpaces?.unshift(space);

		// const list = createPublicSpacesList();
		// console.log(list.id);
		if (isPublic) {
			publicSpaces.current?.unshift(space);
		}
	}

	let createNewSpaceModalOpen = $state(false);

	let publicSpaces = $derived(
		new CoState(SpaceList, 'co_zgqiKqPDZfxYm5AQ7coUB4yG1EL', {
			resolve: {
				$each: true,
				$onError: null
			}
		})
	);

	let editProfileModalOpen = $state(false);
	let handle = $state('');

	async function editProfile() {
		editProfileModalOpen = false;

		let did = await resolveHandle({ handle });
		let profile = await getProfile({ did });

		if (!me.current?.profile) return;
		me.current.profile.name = profile.handle;

		if (profile.avatar) {
			me.current.profile.imageUrl = profile.avatar;
		}
	}

	let imageUrl = $derived.by(() => {
		if (!me.current?.profile?.image) return;
		const highestRes = ImageDefinition.highestResAvailable(me?.current?.profile?.image);
		if (!highestRes) return;
		const blob = highestRes.stream.toBlob();
		if (!blob) return;
		return URL.createObjectURL(blob);
	});

	$effect(() => {
		if (me.current?.root && !me.current.root.lastRead === null) {
			me.current.root.lastRead = LastReadList.create({});
			console.log('created last read list');
		}
	});
	onDestroy(() => {
		if (imageUrl) {
			URL.revokeObjectURL(imageUrl);
		}
	});

	let showSpaceSelection = $state(false);
</script>

<div class={cn('h-[100dvh] px-4')}>
	<div
		class="relative mx-auto flex w-full max-w-2xl flex-col items-start justify-center gap-2 py-24"
	>
		<div class="flex w-full flex-col items-end justify-center gap-2">
			<div class="mx-auto flex items-center gap-2">
				<Avatar src={me.current?.profile.imageUrl} />
				<Heading>
					Hello,
					<span class="font-bold">{me.current?.profile.name} </span>
				</Heading>
			</div>
		</div>

		<Button
			variant="secondary"
			onclick={() => (editProfileModalOpen = true)}
			size="sm"
			class="absolute top-16 right-0"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
				/>
			</svg>

			Edit
		</Button>

		<div class="mt-8 mb-2 flex items-center gap-4">
			<Subheading>Joined spaces</Subheading>

			<Button
				size="sm"
				onclick={() => {
					createNewSpaceModalOpen = true;
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
				</svg>

				Create space
			</Button>
		</div>

		<div class="relative isolate w-full">
			<ul class="flex w-full gap-2 overflow-x-scroll pb-4">
				{#each me.current?.root.joinedSpaces ?? [] as space}
					{#if space}
						<SpaceItem {space} me={me.current} />
					{/if}
				{/each}

				{#if me.current?.root.joinedSpaces?.length === 0}
					<div class="text-base-600 dark:text-base-400 h-30 text-sm">No spaces yet.</div>
				{/if}

				<div class="h-20 w-5 shrink-0"></div>
			</ul>
			<div
				class="from-base-50 dark:from-base-950 pointer-events-none absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l via-transparent"
			></div>
		</div>

		<div class="mt-8 mb-2 flex items-center gap-4">
			<Subheading>Public spaces</Subheading>
		</div>

		<div class="relative isolate w-full">
			<ul class="flex w-full gap-2 overflow-x-scroll pb-4">
				{#each publicSpaces.current ?? [] as space}
					{#if space}
						<SpaceItem {space} me={me.current} />
					{/if}
				{/each}

				{#if publicSpaces.current?.length === 0}
					<div class="text-base-600 dark:text-base-400 h-30 text-sm">No public spaces yet.</div>
				{/if}

				<div class="h-20 w-5 shrink-0"></div>
			</ul>
			<div
				class="from-base-50 dark:from-base-950 pointer-events-none absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l via-transparent"
			></div>
		</div>
	</div>
</div>

<Modal bind:open={editProfileModalOpen}>
	<form onsubmit={editProfile} class="flex flex-col gap-4">
		<Subheading>Set user info from bluesky handle</Subheading>
		<Input bind:value={handle} />
		<Button type="submit">set</Button>
	</form>
</Modal>

<CreateSpaceModal bind:open={createNewSpaceModalOpen} {createNewSpace} />

<ThemeToggle class="absolute top-4 right-4" />

<svelte:window
	onkeydown={(e) => {
		if (e.metaKey && e.key === 'k') {
			showSpaceSelection = true;
		}
	}}
/>

<SpaceSelection spaces={me.current?.root?.joinedSpaces ?? []} bind:open={showSpaceSelection} />
