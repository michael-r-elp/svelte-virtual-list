<script lang="ts">
    import SvelteVirtualList from '$lib/SvelteVirtualList.svelte'
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

<SvelteVirtualList {items} height={400} {itemHeight}>
    {#snippet renderItem(item: Item, index: number)}
        <div class="list-item" bind:this={measureRef}>
            {item.text}
        </div>
    {/snippet}
</SvelteVirtualList>
