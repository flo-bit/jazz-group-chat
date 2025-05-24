<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor, type Content } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import Image from '@tiptap/extension-image';
	import Underline from '@tiptap/extension-underline';
	import Typography from '@tiptap/extension-typography';
	import { RichTextLink } from './RichTextLink';
	import { cn } from '@fuxui/base';
	import { ImageUploadNode } from './image-upload/ImageUploadNode';
	import { initKeyboardShortcutHandler } from './onEnter';

	let {
		content = $bindable({}),
		placeholder = 'Write something...',
		editor = $bindable(null),
		ref = $bindable(null),
		class: className,
		onupdate,
		htmlContent = $bindable(''),
		onEnter,
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
			// Image.configure({
			// 	HTMLAttributes: {
			// 		class: 'max-w-full object-contain relative rounded-2xl'
			// 	},
			// 	allowBase64: true
			// }),
			Underline.configure({}),
			RichTextLink.configure({
				openOnClick: false,
				autolink: true,
				defaultProtocol: 'https'
			}),
			Typography.configure(),
			// ImageUploadNode.configure({
			// 	upload: async (file, onProgress, abortSignal) => {
			// 		console.log('uploading image', file);
			// 		// wait 2 seconds
			// 		for(let i = 0; i < 10; i++) {
			// 			await new Promise((resolve) => setTimeout(resolve, 200));
			// 			onProgress?.({ progress: i / 10 });
			// 		}

			// 		return 'https://picsum.photos/200/300';
			// 	}
			// }),
			initKeyboardShortcutHandler({ onEnter: onEnter }),
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

	// Flag to track whether a file is being dragged over the drop area
	let isDragOver = $state(false);

	// Store local image files for later upload
	let localImages: Map<string, File> = $state(new Map());

	// Track which image URLs in the editor are local previews
	let localImageUrls: Set<string> = $state(new Set());

	// Process image file to create a local preview
	async function processImageFile(file: File) {
		if (!editor) {
			console.warn('Tiptap editor not initialized');
			return;
		}

		try {
			const localUrl = URL.createObjectURL(file);

			localImages.set(localUrl, file);
			localImageUrls.add(localUrl);

			//editor.commands.setImageUploadNode();
			editor.chain().focus().setImageUploadNode(
				{
					preview: localUrl
				}
			).run();

			// wait 2 seconds
			// await new Promise((resolve) => setTimeout(resolve, 500));

			// content = editor.getJSON();

			// console.log('replacing image url in content');
			// replaceImageUrlInContent(content, localUrl, 'https://picsum.photos/200/300');
			// editor.commands.setContent(content);
		} catch (error) {
			console.error('Error creating image preview:', error);
		}
	}

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
	}
	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragOver = false;
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
	}

	onDestroy(() => {
		for (const localUrl of localImageUrls) {
			URL.revokeObjectURL(localUrl);
		}

		editor?.destroy();
	});
</script>

<div
	bind:this={ref}
	class={cn('relative flex-1', className)}
	role="region"
></div>

<!-- onpaste={handlePaste}
ondragover={handleDragOver}
ondragleave={handleDragLeave}
ondrop={handleDrop} -->

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
