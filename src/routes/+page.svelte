<script lang="ts">
	import { Alert, Button, cn, Heading, Subheading, ThemeToggle } from '@fuxui/base';
	import { AccountCoState, CoState } from 'jazz-svelte';
	import { LastReadList, MyAppAccount, SpaceList } from '$lib/schema';
	import { createPublicSpacesList, createSpace } from '$lib/utils';
	import SpaceItem from '$lib/components/SpaceItem.svelte';
	import CreateSpaceModal from '$lib/components/CreateSpaceModal.svelte';
	import SpaceSelection from '$lib/SpaceSelection.svelte';
	import EditProfileModal from '$lib/components/EditProfileModal.svelte';

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
		new CoState(SpaceList, 'co_zYDfDcLXEjmd2f2co1ix64KotL2', {
			resolve: {
				$each: true,
				$onError: null
			}
		})
	);

	let editProfileModalOpen = $state(false);

	$effect(() => {
		if (me.current?.root && !me.current.root.lastRead === null) {
			me.current.root.lastRead = LastReadList.create({});
			console.log('created last read list');
		}

		if (me.current?.root?.joinedSpaces?.length) {
			for (let i = me.current.root.joinedSpaces.length - 1; i >= 0; i--) {
				if (
					me.current.root.joinedSpaces[i] === undefined &&
					!me.current.root.joinedSpaces[i]?.version
				) {
					me.current.root.joinedSpaces.splice(i, 1);
				}
			}
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
				<Heading>
					Hello,
					<span class="font-bold">{me.current?.profile.name}</span>
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

		<Alert title="Demo only" class="mt-8">
			<p>
				This is just a work-in-progress demo, don't expect your spaces/messages/etc to be here
				forever.
			</p>
		</Alert>

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

<EditProfileModal bind:open={editProfileModalOpen} />

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
