<script lang="ts">
	import FilePond from 'svelte-filepond';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let { bindFile, acceptedTypes }: { bindFile: any; acceptedTypes: string[] } = $props();
</script>

<FilePond
	files={bindFile}
	server={{
		process: '/api/v1/file/upload',
		revert: '/api/v1/file/revert',
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		load: (source: any, load: any, error: any) => {
			fetch(source)
				.then((response) => response.blob())
				.then((blob) => {
					load(blob);
				})
				.catch((err) => {
					error(err.message);
				});
		}
	}}
	acceptedFileTypes={acceptedTypes}
	allowMultiple={false}
/>
