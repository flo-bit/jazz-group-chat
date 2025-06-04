<script lang="ts">
	import type { Loaded } from 'jazz-tools';
	import type { SpaceList } from './schema';
	import { base } from '$app/paths';

	// Your cards data
	let { spaces, open = $bindable(false) }: { spaces: Loaded<typeof SpaceList>[]; open: boolean } =
		$props();

	let angle = $state(0);
	let isDragging = $state(false);
	let startX = $state(0);

	const radius = 1000; // px from center to card center
	const cardWidth = 12 * 16; // Tailwind w-32 → 8rem → 128px
	const sensitivity = 0.05; // how many degrees per px/deltaY

	// compute how many degrees each card occupies
	const angularWidth = ((2 * Math.asin(cardWidth / 2 / radius) * 180) / Math.PI) * 0.9;

	const totalArc = angularWidth * (spaces.length + 1);
	const maxAngle = totalArc - angularWidth;

	function clamp(n: number) {
		return Math.min(Math.max(n, -maxAngle), 0);
	}

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		angle = clamp(angle + e.deltaY * sensitivity);
	}

	function onPointerDown(e: PointerEvent) {
		isDragging = true;
		startX = e.clientX;
	}

	function onPointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const dx = e.clientX - startX;
		angle = clamp(angle + dx * sensitivity);
		startX = e.clientX;
	}

	function onPointerUp(e: PointerEvent) {
		isDragging = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="bg-base-300/20 dark:bg-base-950/20 fixed inset-0 z-50 h-[100dvh] w-full touch-none overflow-hidden backdrop-blur-lg select-none"
		onwheel={onWheel}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointerleave={onPointerUp}
		onclick={() => (open = false)}
	>
		<!-- 
	  Center the rotator horizontally (left-1/2 + translateX(-50%))
	  Push its center way below the page (top-[150vh]) 
	-->
		<div
			class="absolute left-1/2 h-0 w-0"
			style="
		transform: rotate({angle}deg);
		bottom: -{radius - 300}px;
	  "
		>
			{#each spaces as space, i}
				{@const θ = i * angularWidth}

				<div
					class="border-base-200 dark:bg-base-950 dark:border-base-800 absolute flex h-48 w-48 items-center justify-center rounded-xl border bg-white p-2 text-xl font-bold shadow-lg transition-transform duration-300 hover:z-50 hover:scale-105"
					style="
			transform:
			  rotate({θ}deg)
			  translateY(-{radius}px);
			transform-origin: center center;
		  "
				>
					<a
						href={`/${space.id}`}
						class="text-base-900 dark:text-base-100 flex h-full w-full flex-col justify-center font-bold"
						onclick={() => (open = false)}
					>
						<div class="mb-1 w-fit text-4xl">{space.emoji || '😀'}</div>
						<span class="absolute inset-x-0 -top-px bottom-0"></span>
						<span class="w-full min-w-0 truncate">
							{space.name}
						</span>
					</a>
				</div>
			{/each}
		</div>
	</div>
{/if}
