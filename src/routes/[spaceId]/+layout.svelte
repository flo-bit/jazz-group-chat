<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { MyAppAccount, Space } from '$lib/schema';
	import { createChannel, isSpaceAdmin } from '$lib/utils';
	import {
		Accordion,
		AccordionItem,
		Button,
		Input,
		Modal,
		Subheading,
		ThemeToggle
	} from '@fuxui/base';

	import Sidebar from '$lib/components/layout/sidebar/Sidebar.svelte';
	import Navbar from '$lib/components/layout/navbar/Navbar.svelte';
	import { AccountCoState, CoState } from 'jazz-svelte';
	import { type Loaded } from 'jazz-tools';
	import Container from '$lib/components/Container.svelte';
	import SpaceSelection from '$lib/SpaceSelection.svelte';

	let spaceId: string = $state(page.params.spaceId);

	let space = $derived(
		new CoState(Space, spaceId, {
			resolve: {
				channels: {
					$each: true,
					$onError: null
				}
			}
		})
	);

	const me = new AccountCoState(MyAppAccount, {
		resolve: {
			profile: true,
			root: true
		}
	});

	afterNavigate(() => {
		spaceId = page.params.spaceId;
	});

	let { children } = $props();

	function hideSidebar() {
		const popover = document.getElementById('mobile-menu');
		if (popover) {
			popover.hidePopover();
		}
	}

	function createNewChannel(space: Loaded<typeof Space>, name: string) {
		const channel = createChannel(name);
		space.channels?.push(channel);
	}

	let isNewChannelModalOpen = $state(false);
	let newChannelName = $state('');

	let showSpaceSelection = $state(false);
</script>

<Navbar hasSidebar class="dark:bg-base-900 bg-white">
	<div class="flex items-center gap-2">
		<Button
			variant="link"
			class="block font-normal backdrop-blur-none lg:hidden"
			popovertarget="mobile-menu"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="size-6!"
			>
				<path
					fill-rule="evenodd"
					d="M3 9a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9Zm0 6.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
					clip-rule="evenodd"
				></path>
			</svg>
		</Button>
	</div>

	<ThemeToggle />
</Navbar>

<Sidebar class="dark:bg-base-900 bg-white px-2 pt-4">
	<Button
		variant="ghost"
		class="mb-4 w-full justify-start backdrop-blur-none"
		href={`${base}/`}
		onclick={hideSidebar}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
			/>
		</svg>

		home
	</Button>

	<Button
		variant="ghost"
		class="mb-2 w-full justify-start backdrop-blur-none"
		href={`${base}/${spaceId}`}
		onclick={hideSidebar}
	>
		<span>{space.current?.emoji}</span>{space.current?.name}
	</Button>

	<Accordion type="multiple" class="w-full" value={['channels']}>
		<AccordionItem
			value="channels"
			class="border-0"
			title={'channels'}
			triggerClasses="text-sm px-3 py-0 font-semibold"
			contentClasses="flex flex-col gap-1 items-start px-1"
		>
			{#each space.current?.channels ?? [] as channel}
				{#if channel}
					<Button
						data-current={page.url.pathname === `${base}/${spaceId}/channel/${channel.id}`}
						variant="ghost"
						onclick={hideSidebar}
						href="{base}/{spaceId}/channel/{channel.id}"
						class="w-full justify-start backdrop-blur-none"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
							/>
						</svg>

						{channel.name}</Button
					>
				{/if}
			{/each}

			{#if isSpaceAdmin(space.current)}
				<Button
					variant="ghost"
					class="mt-8 w-full justify-start backdrop-blur-none"
					onclick={() => {
						hideSidebar();
						isNewChannelModalOpen = true;
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>

					new channel
				</Button>
			{/if}
		</AccordionItem>
	</Accordion>


	<Button
		variant="ghost"
		class="mt-16 w-full justify-start backdrop-blur-none"
		onclick={() => {
			hideSidebar();
			showSpaceSelection = true;
		}}
	>
		Switch space
	</Button>
</Sidebar>

<Modal bind:open={isNewChannelModalOpen}>
	<div class="flex flex-col gap-4">
		<Subheading>create new channel</Subheading>
		<form
			onsubmit={() => {
				createNewChannel(space.current, newChannelName);
				isNewChannelModalOpen = false;
			}}
			class="flex flex-col gap-2"
		>
			<Input type="text" placeholder="channel name" bind:value={newChannelName} />
			<Button type="submit">create</Button>
		</form>
	</div>
</Modal>

<svelte:window
	onkeydown={(e) => {
		if (e.metaKey && e.key === 'k') {
			showSpaceSelection = true;
		}
	}}
/>

<SpaceSelection spaces={me.current?.root?.joinedSpaces ?? []} bind:open={showSpaceSelection} />

<Container>
	{@render children?.()}
</Container>
