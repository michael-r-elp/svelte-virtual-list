<script lang="ts">
    import SvelteVirtualList from '$lib/index.js'
    import { onMount } from 'svelte'

    type Item = {
        id: number
        text: string
    }

    const items: Item[] = Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `Item ${i}` }))

    let measureRef: HTMLElement
    let itemHeight = 20 // default height

    onMount(() => {
        if (measureRef) {
            itemHeight = measureRef.getBoundingClientRect().height
        }
    })
</script>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 600px;">
    <div>
        <SvelteVirtualList {items} {itemHeight} debug>
            {#snippet renderItem(item: Item, index: number)}
                <div bind:this={measureRef}>
                    {item.text}
                </div>
            {/snippet}
        </SvelteVirtualList>
    </div>
    <div>
        <SvelteVirtualList {items} {itemHeight} debug mode="bottomToTop">
            {#snippet renderItem(item: Item, index: number)}
                <div bind:this={measureRef}>
                    {item.text}
                </div>
            {/snippet}
        </SvelteVirtualList>
    </div>
</div>
