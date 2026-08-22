<script lang="ts">
  import Button from "./button.svelte";
  import { session } from "$lib/state/session.svelte";

  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    const d = dialog;
    if (!d) return;
    if (session.pending && !d.open) d.showModal();
    else if (!session.pending && d.open) d.close();
  });

  function onClose() {
    if (session.pending) session.cancelLogin();
  }
</script>

<dialog bind:this={dialog} class="modal" onclose={onClose}>
  <div class="modal-box bg-popover text-popover-foreground max-w-sm rounded-2xl border text-center">
    <img src="https://sonolus.com/logo.png" alt="Sonolus" class="mx-auto mb-4 h-8 w-auto" />
    <div class="mb-3 flex justify-center">
      <span class="loading loading-spinner text-primary size-8"></span>
    </div>
    <h2 class="font-heading text-lg font-semibold tracking-tight">Waiting for confirmation…</h2>
    <p class="text-muted-foreground mt-1 text-sm">
      Approve the login in the Sonolus tab that just opened.
    </p>
    <Button variant="outline" onclick={() => session.cancelLogin()} class="mt-5 w-full rounded-full">
      Cancel
    </Button>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button aria-label="Cancel login">cancel</button>
  </form>
</dialog>
