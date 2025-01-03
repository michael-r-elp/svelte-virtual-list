<script lang="ts">
    import { type Snippet } from 'svelte'

    interface Props {
        items: any[]
        height: number
        itemHeight: number
        debug?: boolean
        containerClass?: string
        viewportClass?: string
        contentClass?: string
        itemsClass?: string
        renderItem: Snippet<[item: any, index: number]>
    }

    const {
        items = [],
        height = 400,
        itemHeight = 40,
        debug = false,
        renderItem,
        containerClass,
        viewportClass,
        contentClass,
        itemsClass
    }: Props = $props()

    let containerElement: HTMLElement
    let viewportElement: HTMLElement
    let scrollTop = $state(0)
    let visibleItems = $derived(() => {
        if (!items.length) return { start: 0, end: 0 }

        const visibleStart = Math.floor(scrollTop / itemHeight)
        const visibleEnd = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight))

        return {
            start: Math.max(0, visibleStart - BUFFER_SIZE),
            end: Math.min(items.length, visibleEnd + BUFFER_SIZE)
        }
    })

    // Add padding to reduce scroll jumps
    const BUFFER_SIZE = 5

    // Replace getVisibleItems and handleScroll with this
    const handleScroll = () => {
        if (!viewportElement) return
        scrollTop = viewportElement.scrollTop
    }
</script>

<div
    id="virtual-list-container"
    class={containerClass ?? 'virtual-list-container'}
    bind:this={containerElement}
    style:height="{height}px"
>
    <div
        id="virtual-list-viewport"
        class={viewportClass ?? 'virtual-list-viewport'}
        bind:this={viewportElement}
        onscroll={handleScroll}
        style:height="{height}px"
    >
        <div
            id="virtual-list-content"
            class={contentClass ?? 'virtual-list-content'}
            style:height="{Math.max(height, items.length * itemHeight)}px"
        >
            <div
                id="virtual-list-items"
                class={itemsClass ?? 'virtual-list-items'}
                style:transform="translateY({visibleItems().start * itemHeight}px)"
            >
                {#each items.slice(visibleItems().start, visibleItems().end) as currentItem, i (currentItem?.id ?? i)}
                    {#if debug && i === 0}
                        {@const debugInfo = {
                            visibleItemsCount: visibleItems().end - visibleItems().start,
                            startIndex: visibleItems().start,
                            endIndex: visibleItems().end,
                            totalItems: items.length
                        }}
                        {console.log('Virtual List Debug:', debugInfo)}
                    {/if}
                    {@render renderItem(currentItem, visibleItems().start + i)}
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .virtual-list-container {
        position: relative;
        width: 100%;
        overflow: hidden;
    }

    .virtual-list-viewport {
        overflow-y: scroll;
        width: 100%;
        -webkit-overflow-scrolling: touch;
    }

    .virtual-list-content {
        position: relative;
        width: 100%;
        min-height: 100%;
    }

    .virtual-list-items {
        position: absolute;
        width: 100%;
        left: 0;
        top: 0;
    }
</style>
