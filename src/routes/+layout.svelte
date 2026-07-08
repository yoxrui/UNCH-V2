<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from "mode-watcher";
	import MobileNav from "$lib/components/mobile-nav.svelte";

	let { children } = $props();
	import "../app.css";
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

<!-- Leave room for the fixed bottom nav on mobile (incl. safe-area inset). -->
<div class="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
	{@render children()}
</div>

<MobileNav />
