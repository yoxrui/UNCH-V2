<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { toggleMode } from "mode-watcher";
  import { toast } from "svelte-sonner";
  import {
    RiSunLine,
    RiMoonClearLine,
    RiSparkling2Line,
    RiGithubLine,
    RiHeart3Fill,
  } from "remixicon-svelte";

  const name = "friend";
  const components = 56;

  function sayHi() {
    toast.success("👋 Hey there — great to see you!", {
      description: "Thanks for checking out the template.",
    });
  }
</script>

<svelte:head>
  <title>Welcome 👋</title>
</svelte:head>

<main class="bg-background text-foreground flex min-h-screen items-center justify-center p-6">
  <Card.Root class="w-full max-w-lg shadow-lg">
    <Card.Header class="text-center">
      <div class="mb-2 flex justify-center">
        <Avatar.Root class="size-16">
          <Avatar.Image src="https://github.com/shadcn.png" alt="avatar" />
          <Avatar.Fallback>SV</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <Card.Title class="text-2xl">
        Hello, {name}! <span class="inline-block">👋</span>
      </Card.Title>
    </Card.Header>

    <Card.Content class="space-y-4">
      <div class="flex flex-wrap justify-center gap-2">
        <Badge variant="secondary">
          <RiSparkling2Line class="mr-1 size-3" />
          Svelte 5
        </Badge>
        <Badge variant="secondary">Tailwind v4</Badge>
        <Badge variant="secondary">{components} components</Badge>
      </div>

      <Separator />

      <p class="text-muted-foreground text-center text-sm">
        This page is built entirely with shadcn-svelte components — cards,
        avatars, badges, buttons and toasts included.
      </p>
    </Card.Content>

    <Card.Footer class="flex flex-col gap-3">
      <Button class="w-full" onclick={sayHi}>
        <RiHeart3Fill class="mr-2 size-4" />
        Say hi back
      </Button>

      <div class="flex w-full gap-3">
        <Button variant="outline" class="flex-1" onclick={toggleMode}>
          <RiSunLine class="mr-2 size-4 dark:hidden" />
          <RiMoonClearLine class="mr-2 hidden size-4 dark:block" />
          Toggle theme
        </Button>
        <Button
          variant="outline"
          class="flex-1"
          href="https://shadcn-svelte.com"
          target="_blank"
        >
          <RiGithubLine class="mr-2 size-4" />
          Docs
        </Button>
      </div>
    </Card.Footer>
  </Card.Root>
</main>
