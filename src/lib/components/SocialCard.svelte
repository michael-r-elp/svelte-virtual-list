<script lang="ts">
    import { onMount } from 'svelte'
    import html2canvas from 'html2canvas'

    export let type: 'og' | 'twitter' = 'og'

    const dimensions = {
        og: { width: 1200, height: 630 },
        twitter: { width: 1200, height: 600 }
    }

    onMount(async () => {
        const element = document.getElementById('social-card')
        if (element) {
            const canvas = await html2canvas(element)
            const dataUrl = canvas.toDataURL('image/png')
            // Save or process the image
        }
    })
</script>

<div
    id="social-card"
    style="width: {dimensions[type].width}px; height: {dimensions[type].height}px;"
    class="relative bg-gradient-to-br from-[#FF3E00] to-[#40B3FF] p-16"
>
    <div class="flex flex-col items-center justify-center h-full text-white">
        <img src="/Humanspeak-bubble.svg" alt="Humanspeak Logo" class="w-32 h-32 mb-8" />
        <h1 class="text-6xl font-bold mb-6">Svelte Virtual List</h1>
        <p class="text-2xl opacity-90">High Performance List Virtualization for Svelte 5</p>

        <!-- Stats/Features -->
        <div class="flex gap-8 mt-12">
            <div class="text-center">
                <div class="text-4xl font-bold">10k+</div>
                <div class="text-sm opacity-80">Items</div>
            </div>
            <div class="text-center">
                <div class="text-4xl font-bold">60fps</div>
                <div class="text-sm opacity-80">Smooth Scroll</div>
            </div>
            <div class="text-center">
                <div class="text-4xl font-bold">5kb</div>
                <div class="text-sm opacity-80">Gzipped</div>
            </div>
        </div>
    </div>

    <!-- Watermark -->
    <div class="absolute bottom-6 right-6 flex items-center gap-2 text-white/80">
        <img src="/Humanspeak-bubble.svg" alt="Humanspeak" class="w-6 h-6" />
        <span>humanspeak.com</span>
    </div>
</div>
