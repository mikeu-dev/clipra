<script lang="ts">
	import { onMount } from 'svelte';
	import 'quill/dist/quill.core.css';
	import 'quill/dist/quill.snow.css';

	type Props = {
		value?: string | null;
		id?: string;
		toolbarId?: string;
	};

	let { value = $bindable(), id = 'editor', toolbarId = 'toolbar-container' }: Props = $props();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let quill: any;

	function onTextChange() {
		value = quill.getSemanticHTML();
	}

	$effect(() => {
		if (quill && value && quill.getSemanticHTML() !== value) {
			quill.clipboard.dangerouslyPasteHTML(value || '', 'user');
		}
	});

	onMount(() => {
		let cleanupFn: (() => void) | undefined;

		const initEditor = async () => {
			const { default: Quill } = await import('quill');

			quill = new Quill(`#${id}`, {
				theme: 'snow',
				modules: {
					toolbar: `#${toolbarId}`
				}
			});

			quill.clipboard.dangerouslyPasteHTML(value || '', 'user');

			quill.on('text-change', onTextChange);

			// Custom Image Handler Function
			function selectLocalImage() {
				const input = document.createElement('input');
				input.setAttribute('type', 'file');
				input.setAttribute('accept', 'image/*');
				input.click();

				input.onchange = async () => {
					const file = input.files ? input.files[0] : null;
					if (!file) return;

					const formData = new FormData();
					formData.append('file', file);

					try {
						const response = await fetch('/api/file/upload', {
							method: 'POST',
							body: formData
						});

						if (!response.ok) {
							console.error('Failed to upload image');
							return;
						}

						// Bawaan backend me'return' nama file murni, bukan JSON API biasa
						let filename = await response.text();

						// Kadangkala text content fetch tsb ter-quote / terselip karakter quote json jika tipe kembaliannya application/json
						filename = filename.replace(/^"|"$/g, '');

						// Mendapatkan URL static resource
						const url = `/tmp/${filename}`;

						// Insert image placeholder ke cursor pos
						const range = quill.getSelection(true);
						quill.insertEmbed(range.index, 'image', url);

						// Move cursor ke kanan image
						quill.setSelection(range.index + 1);
					} catch (error) {
						console.error('Gagal memproses gambar:', error);
					}
				};
			}

			// Override tombol gambar default
			quill.getModule('toolbar').addHandler('image', selectLocalImage);

			cleanupFn = () => {
				quill.off('text-change', onTextChange);
			};
		};

		initEditor();

		return () => {
			if (cleanupFn) cleanupFn();
		};
	});
</script>

<svelte:head>
	<script
		src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
	></script>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
	/>
	<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
</svelte:head>

<div id={toolbarId}>
	<span class="ql-formats">
		<select class="ql-font"></select>
		<select class="ql-size"></select>
	</span>
	<span class="ql-formats">
		<button aria-label="ql-bold" class="ql-bold"></button>
		<button aria-label="ql-italic" class="ql-italic"></button>
		<button aria-label="ql-underline" class="ql-underline"></button>
		<button aria-label="ql-strike" class="ql-strike"></button>
	</span>
	<span class="ql-formats">
		<select class="ql-color"></select>
		<select class="ql-background"></select>
	</span>
	<span class="ql-formats">
		<button aria-label="ql-script-sub" class="ql-script" value="sub"></button>
		<button aria-label="ql-script-super" class="ql-script" value="super"></button>
	</span>
	<span class="ql-formats">
		<button aria-label="ql-header-1" class="ql-header" value="1"></button>
		<button aria-label="ql-header-2" class="ql-header" value="2"></button>
		<button aria-label="ql-blockquote" class="ql-blockquote"></button>
		<button aria-label="ql-code-block" class="ql-code-block"></button>
	</span>
	<span class="ql-formats">
		<button aria-label="ql-list-ordered" class="ql-list" value="ordered"></button>
		<button aria-label="ql-list-bullet" class="ql-list" value="bullet"></button>
		<button aria-label="ql-indent-min-1" class="ql-indent" value="-1"></button>
		<button aria-label="ql-indent-plus-1" class="ql-indent" value="+1"></button>
	</span>
	<span class="ql-formats">
		<button aria-label="ql-direction" class="ql-direction" value="rtl"></button>
		<select class="ql-align"></select>
	</span>
	<span class="ql-formats">
		<button aria-label="ql-link" class="ql-link"></button>
		<button aria-label="ql-image" class="ql-image"></button>
		<button aria-label="ql-video" class="ql-video"></button>
		<button aria-label="ql-formula" class="ql-formula"></button>
	</span>
	<span class="ql-formats">
		<button aria-label="ql-clean" class="ql-clean"></button>
	</span>
</div>
<div {id}></div>
