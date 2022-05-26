<!--
Special route for handling invalid URI requests. See `/server.js`
-->
<script context="module" lang="ts">
	/** @type {import('@sveltejs/kit').Load} */
	export function load({ params }) {
		return {
			status: 400,
			error: new Error(`Bad request - malformed URI: /${params.path}`)
		};
	}
</script>
