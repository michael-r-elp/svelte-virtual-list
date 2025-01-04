<!--
    @component
    A high-performance virtualized list component that efficiently renders large datasets
    by only mounting DOM nodes for visible items and a small buffer.

    Props:
    - `items` - Array of items to render
    - `defaultEstimatedItemHeight` - Initial height estimate for items (default: 40px)
    - `mode` - Scroll direction: 'topToBottom' or 'bottomToTop' (default: 'topToBottom')
    - `debug` - Enable debug logging (default: false)
    - `bufferSize` - Number of items to render outside visible area (default: 20)
    - `containerClass` - Custom class for container element
    - `viewportClass` - Custom class for viewport element
    - `contentClass` - Custom class for content wrapper
    - `itemsClass` - Custom class for items wrapper
    - `debugFunction` - Custom debug logging function

    Usage:
    ```svelte
    <SvelteVirtualList
        items={data}
        defaultEstimatedItemHeight={40}
        mode="topToBottom"
    >
        {#snippet renderItem(item, index)}
            <div class="item">{item.text}</div>
        {/snippet}
    </SvelteVirtualList>
    ```

    Features:
    - Dynamic height calculation
    - Bidirectional scrolling
    - Configurable buffer size
    - Debug mode
    - Custom styling
-->

<script lang="ts">
    import { onMount } from 'svelte'
    import { BROWSER } from 'esm-env'
    import type { DebugInfo, Props } from './types.js'

    const {
        items = [],
        defaultEstimatedItemHeight = 40,
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
    const itemElements = $state<HTMLElement[]>([])
    let scrollTop = $state(0)
    let initialized = $state(false)
    let height = $state(0)
    let calculatedItemHeight = $state(defaultEstimatedItemHeight)
    let isCalculatingHeight = $state(false)
    let lastMeasuredIndex = $state(-1)
    let heightUpdateTimeout: ReturnType<typeof setTimeout> | null = null
    let resizeObserver: ResizeObserver | null = null

    // Only run measurements in BROWSER environment
    const calculateAverageHeight = () => {
        if (!BROWSER || isCalculatingHeight || heightUpdateTimeout) return
        isCalculatingHeight = true

        if (heightUpdateTimeout) {
            clearTimeout(heightUpdateTimeout)
        }

        heightUpdateTimeout = setTimeout(() => {
            const visibleRange = visibleItems()
            const currentIndex = visibleRange.start

            if (currentIndex !== lastMeasuredIndex) {
                const validElements = itemElements.filter((el) => el)
                if (validElements.length > 0) {
                    const heights = validElements.map((el) => el.getBoundingClientRect().height)
                    const averageHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length

                    if (
                        averageHeight > 0 &&
                        !isNaN(averageHeight) &&
                        Math.abs(averageHeight - calculatedItemHeight) > 1
                    ) {
                        calculatedItemHeight = averageHeight
                        lastMeasuredIndex = currentIndex
                    }
                }
            }

            isCalculatingHeight = false
            heightUpdateTimeout = null
        }, 200)
    }

    $effect(() => {
        if (BROWSER && itemElements.length > 0 && !isCalculatingHeight) {
            calculateAverageHeight()
        }
    })

    // Initialize height only in BROWSER
    $effect(() => {
        if (BROWSER && containerElement) {
            height = containerElement.getBoundingClientRect().height
        }
    })

    // Scroll initialization with delay for bottomToTop
    $effect(() => {
        if (
            BROWSER &&
            mode === 'bottomToTop' &&
            viewportElement &&
            height > 0 &&
            items.length &&
            !initialized
        ) {
            const totalHeight = items.length * calculatedItemHeight
            // Add delay to ensure layout is complete
            setTimeout(() => {
                if (viewportElement) {
                    viewportElement.scrollTop = totalHeight - height
                    scrollTop = totalHeight - height
                    initialized = true
                }
            }, 50) // Small delay to ensure DOM layout is complete
        }
    })

    const visibleItems = $derived(() => {
        if (!items.length) return { start: 0, end: 0 }

        const viewportHeight = height || 0

        const result =
            mode === 'bottomToTop'
                ? (() => {
                      const visibleCount = Math.ceil(viewportHeight / calculatedItemHeight) + 1
                      const bottomIndex =
                          items.length - Math.floor(scrollTop / calculatedItemHeight)
                      // Add buffer to both ends
                      const start = Math.max(0, bottomIndex - visibleCount - bufferSize)
                      const end = Math.min(items.length, bottomIndex + bufferSize)
                      return { start, end }
                  })()
                : (() => {
                      const start = Math.floor(scrollTop / calculatedItemHeight)
                      const end = Math.min(
                          items.length,
                          start + Math.ceil(viewportHeight / calculatedItemHeight) + 1
                      )
                      // Add buffer to both ends
                      return {
                          start: Math.max(0, start - bufferSize),
                          end: Math.min(items.length, end + bufferSize)
                      }
                  })()

        return result
    })

    // Handle scroll updates only in BROWSER
    const handleScroll = () => {
        if (!BROWSER || !viewportElement) return
        scrollTop = viewportElement.scrollTop
    }

    // Update height when container is resized
    const updateHeight = () => {
        if (containerElement) {
            height = containerElement.getBoundingClientRect().height
        }
    }

    // Update height and scroll position
    const updateHeightAndScroll = (immediate = false) => {
        const delay = immediate ? 0 : 100 // Increased delay for initial layout

        // For the initial setup, we'll do two passes to ensure proper layout
        if (!initialized && mode === 'bottomToTop') {
            // First pass - just get initial height
            setTimeout(() => {
                if (containerElement) {
                    height = containerElement.getBoundingClientRect().height

                    // Second pass - set scroll position after layout is stable
                    setTimeout(() => {
                        if (containerElement && viewportElement) {
                            const finalHeight = containerElement.getBoundingClientRect().height
                            height = finalHeight
                            const totalHeight = items.length * calculatedItemHeight
                            viewportElement.scrollTop = totalHeight - finalHeight
                            scrollTop = totalHeight - finalHeight
                            initialized = true
                        }
                    }, 50) // Additional delay for final position
                }
            }, delay)
            return
        }

        // Normal resize handling
        setTimeout(() => {
            if (containerElement) {
                const oldHeight = height
                const newHeight = containerElement.getBoundingClientRect().height
                height = newHeight

                if (mode === 'bottomToTop' && viewportElement && initialized) {
                    // Maintain position on resize
                    const visibleIndex = Math.floor(scrollTop / calculatedItemHeight)
                    const newScrollTop = visibleIndex * calculatedItemHeight
                    viewportElement.scrollTop = newScrollTop
                    scrollTop = newScrollTop
                }
            }
        }, delay)
    }

    onMount(() => {
        if (BROWSER) {
            // Initial height and scroll setup with delay
            updateHeightAndScroll()

            // Setup resize observer
            resizeObserver = new ResizeObserver(() => {
                updateHeightAndScroll(true)
            })

            if (containerElement) {
                resizeObserver.observe(containerElement)
            }

            return () => {
                if (resizeObserver) {
                    resizeObserver.disconnect()
                }
            }
        }
    })
</script>

<div
    id="virtual-list-container"
    data-testid="virtual-list-container"
    class={containerClass ?? 'virtual-list-container'}
    bind:this={containerElement}
>
    <div
        id="virtual-list-viewport"
        data-testid="virtual-list-viewport"
        class={viewportClass ?? 'virtual-list-viewport'}
        bind:this={viewportElement}
        onscroll={handleScroll}
    >
        <div
            id="virtual-list-content"
            class={contentClass ?? 'virtual-list-content'}
            data-testid="virtual-list-content"
            style:height="{Math.max(height, items.length * calculatedItemHeight)}px"
        >
            <div
                id="virtual-list-items"
                class={itemsClass ?? 'virtual-list-items'}
                style:transform="translateY({mode === 'bottomToTop'
                    ? (items.length - visibleItems().end) * calculatedItemHeight
                    : visibleItems().start * calculatedItemHeight}px)"
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
                    <div bind:this={itemElements[i]}>
                        {@render renderItem(
                            currentItem,
                            mode === 'bottomToTop'
                                ? items.length - (visibleItems().start + i) - 1
                                : visibleItems().start + i
                        )}
                    </div>
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
