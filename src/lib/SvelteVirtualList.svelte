<script lang="ts">
    import type { DebugInfo, Props } from './types.js'

    const {
        items = [],
        height = 400,
        itemHeight = 40,
        debug = false,
        renderItem,
        containerClass,
        viewportClass,
        contentClass,
        itemsClass,
        debugFunction,
        mode = 'topToBottom'
    }: Props = $props()

    let containerElement: HTMLElement
    let viewportElement: HTMLElement
    let scrollTop = $state(0)
    let initialized = $state(false)

    // Initialize scroll position for bottom-to-top mode
    $effect(() => {
        if (mode === 'bottomToTop' && viewportElement && !initialized) {
            const maxScroll = Math.max(0, items.length * itemHeight)
            viewportElement.scrollTop = maxScroll
            scrollTop = maxScroll
            initialized = true
        }
    })

    let visibleItems = $derived(() => {
        if (!items.length) return { start: 0, end: 0 }

        const visibleStart = Math.floor(scrollTop / itemHeight)
        const visibleEnd = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight))

        if (mode === 'bottomToTop') {
            // Reverse the visible range for bottom-to-top mode
            return {
                start: Math.max(0, items.length - visibleEnd - BUFFER_SIZE),
                end: Math.min(items.length, items.length - visibleStart + BUFFER_SIZE)
            }
        }

        return {
            start: Math.max(0, visibleStart - BUFFER_SIZE),
            end: Math.min(items.length, visibleEnd + BUFFER_SIZE)
        }
    })

    // Add padding to reduce scroll jumps
    const BUFFER_SIZE = 5

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
                style:transform="translateY({mode === 'bottomToTop'
                    ? (items.length - visibleItems().end) * itemHeight
                    : visibleItems().start * itemHeight}px)"
            >
                {#each mode === 'bottomToTop' ? items
                          .slice(visibleItems().start, visibleItems().end)
                          .reverse() : items.slice(visibleItems().start, visibleItems().end) as currentItem, i (currentItem?.id ?? i)}
                    {#if debug && i === 0}
                        {@const debugInfo: DebugInfo = {
                            visibleItemsCount: visibleItems().end - visibleItems().start,
                            startIndex: visibleItems().start,
                            endIndex: visibleItems().end,
                            totalItems: items.length
                        }}
                        {debugFunction
                            ? debugFunction(debugInfo)
                            : console.log('Virtual List Debug:', debugInfo)}
                    {/if}
                    {@render renderItem(
                        currentItem,
                        mode === 'bottomToTop'
                            ? items.length - (visibleItems().start + i) - 1
                            : visibleItems().start + i
                    )}
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
