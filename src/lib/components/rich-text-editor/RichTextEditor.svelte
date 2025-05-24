<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor, type Content } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import Image from '@tiptap/extension-image';
	import Underline from '@tiptap/extension-underline';
	import Typography from '@tiptap/extension-typography';
	import { RichTextLink } from './RichTextLink';
	import { Button, cn } from '@fuxui/base';
	import { ImageUploadNode } from './image-upload/ImageUploadNode';
	import { initKeyboardShortcutHandler } from './onEnter';
	import { ImageList } from '$lib/schema';
	import type { Loaded } from 'jazz-tools';
	import { createImage } from 'jazz-browser-media-images';
	import { publicGroup } from '$lib/utils';
	import { Portal } from 'bits-ui';

	let {
		content = $bindable({}),
		placeholder = 'Write something...',
		editor = $bindable(null),
		ref = $bindable(null),
		class: className,
		onupdate,
		htmlContent = $bindable(''),
		processImageFile,
		onEnter
	}: {
		content?: Content;
		placeholder?: string;
		editor?: Editor | null;
		ref?: HTMLDivElement | null;
		class?: string;
		onupdate?: (content: Content) => void;
		ontransaction?: () => void;
		htmlContent?: string;
		onEnter: () => void;
		processImageFile: (file: File) => void;
	} = $props();

	let hasFocus = true;

	onMount(() => {
		if (!ref) return;

		let extensions = [
			StarterKit.configure({
				dropcursor: {
					class: 'text-accent-500/30 rounded-2xl',
					width: 2
				},
				codeBlock: false,
				heading: {
					levels: [1, 2, 3]
				}
			}),
			Placeholder.configure({
				placeholder: ({ node }) => {
					// only show in paragraphs
					if (node.type.name === 'paragraph' || node.type.name === 'heading') {
						return placeholder;
					}
					return '';
				}
			}),
			Underline.configure({}),
			RichTextLink.configure({
				openOnClick: false,
				autolink: true,
				defaultProtocol: 'https'
			}),
			Typography.configure(),
			initKeyboardShortcutHandler({ onEnter: onEnter })
		];

		editor = new Editor({
			element: ref,
			extensions,
			editorProps: {
				attributes: {
					class: 'outline-none'
				}
			},
			onUpdate: (ctx) => {
				content = ctx.editor.getJSON();
				htmlContent = ctx.editor.getHTML();
				onupdate?.(content);
			},
			onFocus: () => {
				hasFocus = true;
			},
			onBlur: () => {
				hasFocus = false;
			},
			content: ``
		});
	});

	let isDragOver = $state(false);

	const handlePaste = (event: ClipboardEvent) => {
		const items = event.clipboardData?.items;
		if (!items) return;
		// Check for image data in clipboard
		for (const item of Array.from(items)) {
			if (!item.type.startsWith('image/')) continue;
			const file = item.getAsFile();
			if (!file) continue;
			event.preventDefault();
			processImageFile(file);
			return;
		}
	};

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragOver = true;
		console.log('drag over');
	}
	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragOver = false;
		console.log('drag leave');
	}
	function handleDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragOver = false;
		if (!event.dataTransfer?.files?.length) return;
		const file = event.dataTransfer.files[0];
		if (file?.type.startsWith('image/')) {
			processImageFile(file);
		}
		console.log('drop');
	}

	onDestroy(() => {
		editor?.destroy();
	});
</script>

<svelte:window ondragover={handleDragOver} ondragleave={handleDragLeave} ondrop={handleDrop} />

{#if isDragOver}
	<Portal>
		<div
			class="bg-base-300/50 dark:bg-base-800/50 backdrop-blur-md text-base-900 dark:text-base-100 pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl z-[1000]"
		>
			Drop image to add it to your message
		</div>
	</Portal>
{/if}

<div class={cn('relative flex items-center', className)}>
	<Button
		size="icon"
		variant="ghost"
		class="mr-2"
		onclick={() => {
			// file upload
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = 'image/*';
			input.onchange = (event) => {
				const file = (event.target as HTMLInputElement).files?.[0];
				if (!file) return;
				processImageFile(file);
				input.remove();
			};
			input.click();
		}}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-6"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
		</svg>
	</Button>
	<div bind:this={ref} onpaste={handlePaste}></div>
</div>

<!--  -->

<style>
	:global(.tiptap) {
		:first-child {
			margin-top: 0;
		}

		:global(img) {
			display: block;
			height: auto;
			margin: 1.5rem 0;
			max-width: 100%;

			&.ProseMirror-selectednode {
				outline: 3px solid var(--color-accent-500);
			}
		}

		:global(div[data-type='image-upload']) {
			&.ProseMirror-selectednode {
				outline: 3px solid var(--color-accent-500);
			}
		}

		:global(blockquote p:first-of-type::before) {
			content: none;
		}

		:global(blockquote p:last-of-type::after) {
			content: none;
		}

		:global(blockquote p) {
			font-style: normal;
		}
	}

	:global(.tiptap .is-empty::before) {
		color: var(--color-base-500);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}
</style>
