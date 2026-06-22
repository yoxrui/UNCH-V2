<script lang="ts">
  import * as Pagination from "$lib/components/ui/pagination/index.js";

  let {
    count,
    perPage = 10,
    page = $bindable(1),
  }: { count: number; perPage?: number; page?: number } = $props();
</script>

{#if count > perPage}
  <Pagination.Root {count} {perPage} bind:page siblingCount={1}>
    {#snippet children({ pages, currentPage })}
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.PrevButton />
        </Pagination.Item>
        {#each pages as p (p.key)}
          {#if p.type === "ellipsis"}
            <Pagination.Item>
              <Pagination.Ellipsis />
            </Pagination.Item>
          {:else}
            <Pagination.Item>
              <Pagination.Link page={p} isActive={currentPage === p.value}>
                {p.value}
              </Pagination.Link>
            </Pagination.Item>
          {/if}
        {/each}
        <Pagination.Item>
          <Pagination.NextButton />
        </Pagination.Item>
      </Pagination.Content>
    {/snippet}
  </Pagination.Root>
{/if}
