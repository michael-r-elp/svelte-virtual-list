<script lang="ts">
    import { page } from '$app/state'

    // Dimensions for different social platforms
    const dimensions = {
        og: { width: 1200, height: 630, name: 'OpenGraph Card' },
        twitter: { width: 1200, height: 600, name: 'Twitter Card' }
    }

    // Use $ for derived values in Svelte 5
    const cardType = $derived(page.url.searchParams.get('type') || 'og')
    const activeDimensions = $derived(dimensions[cardType as keyof typeof dimensions])
</script>

<div
    class="relative bg-[radial-gradient(circle_at_95%_95%,_#FF3E00_0%,_#40D1A7_40%,_#40D1A7_70%,_#40D1A7_100%)] text-white p-16 overflow-hidden"
    style:width="{activeDimensions.width}px"
    style:height="{activeDimensions.height}px"
>
    <!-- Add a subtle overlay to soften the gradient -->
    <div class="absolute inset-0 bg-black/5 backdrop-blur-[1px]"></div>

    <!-- Decorative background elements with reduced opacity -->
    <div class="absolute inset-0 opacity-5">
        <div class="absolute -right-40 -top-40 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
        <div class="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
    </div>

    <div class="relative flex flex-col h-full justify-between z-10">
        <div class="space-y-6">
            <div class="text-sm uppercase tracking-wider text-violet-200 font-medium">
                {cardType === 'og' ? 'High Performance Virtual List' : 'Virtual List Component'}
            </div>
            <h1
                class:text-7xl={cardType === 'og'}
                class:text-6xl={cardType === 'twitter'}
                class="font-bold tracking-tight"
            >
                Svelte Virtual List
            </h1>
            <p
                class:text-3xl={cardType === 'og'}
                class:text-2xl={cardType === 'twitter'}
                class="text-violet-100 font-medium leading-relaxed"
            >
                {cardType === 'og'
                    ? 'Efficiently render thousands of items with minimal memory usage'
                    : 'Dynamic heights • Bidirectional scrolling • TypeScript support'}
            </p>
        </div>

        <div class="flex justify-between items-end">
            <div class="flex items-center gap-1 bg-white/10 px-4 py-2 rounded-full">
                <img src="/Humanspeak-bubble.svg" alt="Logo" class="h-8" />
                <span class="text-lg font-medium">by Humanspeak</span>
            </div>
            <div class="flex items-center gap-1 bg-white/10 px-4 py-2 rounded-full">
                <img src="./svelte-logo.svg" alt="Svelte" class="h-8" />
                <span class="text-lg font-medium">Built for Svelte 5</span>
            </div>
        </div>
    </div>
</div>

<!-- Preview Controls -->
<div class="fixed top-4 right-4 flex gap-4 bg-white p-4 rounded shadow-lg">
    <a
        href="?type=og"
        class="px-4 py-2 rounded"
        class:bg-blue-500={cardType === 'og'}
        class:text-white={cardType === 'og'}
        class:bg-gray-200={cardType !== 'og'}
    >
        OpenGraph
    </a>
    <a
        href="?type=twitter"
        class="px-4 py-2 rounded"
        class:bg-blue-500={cardType === 'twitter'}
        class:text-white={cardType === 'twitter'}
        class:bg-gray-200={cardType !== 'twitter'}
    >
        Twitter
    </a>
    <button class="px-4 py-2 bg-green-500 text-white rounded">
        Download
    </button>
</div>

<style>
    :global(body) {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
        background: #f0f0f0;
    }
</style>