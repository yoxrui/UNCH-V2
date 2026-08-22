<script lang="ts">
	import { ModeWatcher } from "mode-watcher";
	import MobileNav from "$lib/components/mobile-nav.svelte";
	import LoginModal from "$lib/components/login-modal.svelte";
	import { onMount } from "svelte";
	import { session } from "$lib/state/session.svelte";
	import { restoreAccent } from "$lib/state/accent.js";

	let { children } = $props();
	import "../app.css";

	onMount(() => {
		restoreAccent();
		session.init();
	});
</script>

<svelte:head>
	<link rel="icon" href="/636a8f1e76b38cb1b9eb0a3d88d7df6f.png" />
</svelte:head>

<ModeWatcher />

<!-- Leave room for the fixed bottom nav on mobile (incl. safe-area inset). -->
<div class="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
	{@render children()}
</div>

<MobileNav />

<LoginModal />
