<script lang="ts">
    import { page } from '$app/state'
    import html2canvas from 'html2canvas'

    const dimensions = {
        og: { width: 1200, height: 630, name: 'OpenGraph Card' },
        twitter: { width: 1200, height: 600, name: 'Twitter Card' }
    }

    const cardType = $derived(page.url.searchParams.get('type') || 'og')
    const activeDimensions = $derived(dimensions[cardType as keyof typeof dimensions])

    const features = [
        'Dynamic Heights',
        'Bidirectional Scrolling',
        'TypeScript Support',
        '5kb Gzipped'
    ]

    async function downloadCard() {
        const card = document.getElementById('social-card')
        if (!card) return

        try {
            const canvas = await html2canvas(card, {
                scale: 2, // Higher resolution
                backgroundColor: null,
                logging: false,
                allowTaint: true,
                useCORS: true,
                onclone: (clonedDoc) => {
                    // Fix any specific styles in the cloned document if needed
                    const clonedCard = clonedDoc.getElementById('social-card')
                    if (clonedCard) {
                        clonedCard.style.transform = 'none'
                        clonedCard.style.padding = '64px' // 16 * 4 = p-16
                    }
                }
            })

            const link = document.createElement('a')
            link.download = `svelte-virtual-list-${cardType}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()
        } catch (error) {
            console.error('Error generating image:', error)
        }
    }
</script>

<div
    id="social-card"
    class=" flex relative bg-[radial-gradient(circle_at_95%_95%,_#FF3E00_0%,_#54DBBC_40%,_#4AE3B6_70%,_#40D1A7_100%)] text-white p-16 overflow-hidden"
    style:width="{activeDimensions.width}px"
    style:height="{activeDimensions.height}px"
>
    <div class="absolute inset-0 bg-black/5 backdrop-blur-[1px]"></div>

    <div class="relative flex flex-col h-full justify-between z-10">
        <!-- Header Section -->
        <div class="space-y-8">
            <div class="text-lg uppercase tracking-wider text-white/80 font-medium">
                {cardType === 'og' ? 'High Performance Virtual List' : 'Virtual List Component'}
            </div>
            <h1
                class:text-8xl={cardType === 'og'}
                class:text-7xl={cardType === 'twitter'}
                class="font-bold tracking-tight leading-tight"
            >
                Svelte Virtual List
            </h1>
            <p
                class:text-4xl={cardType === 'og'}
                class:text-3xl={cardType === 'twitter'}
                class="text-white/90 font-medium leading-relaxed max-w-3xl"
            >
                Efficiently render thousands of items with minimal memory usage
            </p>
        </div>

        <!-- Features Section -->
        <div class="space-y-12 flex flex-col justify-between">
            <!-- Feature Pills -->
            <div class="flex flex-wrap gap-4">
                {#each features as feature}
                    <div class="bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full text-lg font-medium">
                        {feature}
                    </div>
                {/each}
            </div>
        </div>

            <!-- Bottom Bar -->
            <div class="flex justify-between items-end">
                <div class="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                    <img src="/humanspeak-bubble.svg" alt="Logo" class="h-8" />
                    <span class="text-xl font-medium">by Humanspeak</span>
                </div>
                <div class="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                    <img src="./svelte-logo.svg" alt="Svelte" class="h-8" />
                    <span class="text-xl font-medium">Built for Svelte 5</span>
                </div>
            </div>
    </div>
</div>

<!-- Updated Preview Controls -->
<div class="fixed top-4 right-4 flex gap-4 bg-white p-4 rounded-lg shadow-lg">
    <a
        href="?type=og"
        class="px-4 py-2 rounded-md transition-colors"
        class:bg-violet-500={cardType === 'og'}
        class:text-white={cardType === 'og'}
        class:bg-gray-100={cardType !== 'og'}
        class:hover:bg-gray-200={cardType !== 'og'}
    >
        OpenGraph
    </a>
    <a
        href="?type=twitter"
        class="px-4 py-2 rounded-md transition-colors"
        class:bg-violet-500={cardType === 'twitter'}
        class:text-white={cardType === 'twitter'}
        class:bg-gray-100={cardType !== 'twitter'}
        class:hover:bg-gray-200={cardType !== 'twitter'}
    >
        Twitter
    </a>
    <button
        onclick={downloadCard}
        class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center gap-2"
    >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Download {cardType.toUpperCase()}
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