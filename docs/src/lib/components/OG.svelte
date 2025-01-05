<script lang="ts">
    const {
        type = 'og',
        url
    }: {
        type: 'og' | 'twitter'
        url: string
    } = $props()

    const dimensions = {
        og: { width: 1200, height: 630, name: 'OpenGraph Card' },
        twitter: { width: 1200, height: 600, name: 'Twitter Card' }
    }

    const activeDimensions = $derived(dimensions[type])

    const features = [
        'Dynamic Heights',
        'Bidirectional Scrolling',
        'TypeScript Support',
        '5kb Gzipped'
    ]
</script>

<div
    id="social-card"
    class="relative overflow-hidden bg-[radial-gradient(circle_at_95%_95%,_#FF3E00_0%,_#54DBBC_40%,_#4AE3B6_70%,_#40D1A7_100%)] p-16 text-white flex flex-col"
    style:width="{activeDimensions.width}px"
    style:height="{activeDimensions.height}px"
>
    <div class="absolute inset-0 bg-black/5 backdrop-blur-[1px]"></div>
    <div class="relative flex h-full flex-col justify-between">
        <!-- Header Section -->
        <div class="space-y-8">
            <div class="text-lg font-medium uppercase tracking-wider text-white/80">
                {type === 'og' ? 'High Performance Virtual List' : 'Virtual List Component'}
            </div>
            <h1
                class:text-8xl={type === 'og'}
                class:text-7xl={type === 'twitter'}
                class="font-bold leading-tight tracking-tight"
            >
                Svelte Virtual List
            </h1>
            <p
                class:text-4xl={type === 'og'}
                class:text-3xl={type === 'twitter'}
                class="max-w-3xl font-medium leading-relaxed text-white/90"
            >
                Efficiently render thousands of items with minimal memory usage
            </p>
        </div>

        <!-- Features Section -->
        <div class="flex flex-col justify-between space-y-12">
            <!-- Feature Pills -->
            <div class="flex flex-wrap gap-4">
                {#each features as feature}
                    <div
                        class="rounded-full bg-white/10 px-6 py-2 text-lg font-medium backdrop-blur-sm"
                    >
                        {feature}
                    </div>
                {/each}
            </div>
        </div>

        <!-- Bottom Bar -->
        <div class="flex w-full items-end justify-between">
            <div
                class="flex items-center gap-1 rounded-full bg-white/10 px-6 py-3 backdrop-blur-sm"
            >
                <img src="{url}/humanspeak-bubble.svg" alt="Logo" class="h-8" />
                <span class="text-xl font-medium">by Humanspeak</span>
            </div>
            <div
                class="flex items-center gap-1 rounded-full bg-white/10 px-6 py-3 backdrop-blur-sm"
                style="margin-right: -32px;"
            >
                <img src="{url}/svelte-logo.svg" alt="Svelte" class="h-8" />
                <span class="text-xl font-medium">Built for Svelte 5</span>
            </div>
        </div>
    </div>
</div>
