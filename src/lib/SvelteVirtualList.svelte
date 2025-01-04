<script lang="ts">
    import { onMount } from 'svelte'
    import type { DebugInfo, Props } from './types.js'

    const {
        items = [],
        itemHeight = 40,
        debug = false,
        renderItem,
        containerClass,
        viewportClass,
        contentClass,
        itemsClass,
        debugFunction,
        mode = 'topToBottom',
        bufferSize = 20
    }: Props = $props()

    let containerElement: HTMLElement
    let viewportElement: HTMLElement
    let scrollTop = $state(0)
    let initialized = $state(false)
    let height = $state(0)

    // Initialize height
    $effect(() => {
        if (containerElement) {
            height = containerElement.getBoundingClientRect().height
        }
    })

    // Separate effect for scroll initialization
    $effect(() => {
        if (
            mode === 'bottomToTop' &&
            viewportElement &&
            height > 0 &&
            items.length &&
            !initialized
        ) {
            // Calculate total content height and max scroll position
            const totalHeight = items.length * itemHeight
            const maxScroll = totalHeight - height + itemHeight / 2 // Add half item height to ensure full scroll

            // Force scroll to bottom
            requestAnimationFrame(() => {
                viewportElement.scrollTop = maxScroll
                scrollTop = maxScroll
                initialized = true
            })
        }
    })

    let visibleItems = $derived(() => {
        if (!items.length) return { start: 0, end: 0 }

        if (mode === 'bottomToTop' && !initialized) {
            // Show the absolute last items while initializing
            return {
                start: Math.max(0, items.length - Math.ceil(height / itemHeight)),
                end: items.length
            }
        }

        const visibleStart = Math.floor(scrollTop / itemHeight)
        const visibleEnd = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight))

        if (mode === 'bottomToTop') {
            return {
                start: Math.max(0, items.length - visibleEnd - bufferSize),
                end: Math.min(items.length, items.length - visibleStart + bufferSize)
            }
        }

        return {
            start: Math.max(0, visibleStart - bufferSize),
            end: Math.min(items.length, visibleEnd + bufferSize)
        }
    })

    // Handle scroll updates
    const handleScroll = () => {
        if (!viewportElement) return
        scrollTop = viewportElement.scrollTop
    }

    onMount(() => {
        if (containerElement) {
            height = containerElement.getBoundingClientRect().height
        }
    })
</script>

<div
    id="virtual-list-container"
    class={containerClass ?? 'virtual-list-container'}
    bind:this={containerElement}
>
    <div
        id="virtual-list-viewport"
        class={viewportClass ?? 'virtual-list-viewport'}
        bind:this={viewportElement}
        onscroll={handleScroll}
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
        height: 100%;
        overflow: hidden;
    }

    .virtual-list-viewport {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow-y: scroll;
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
