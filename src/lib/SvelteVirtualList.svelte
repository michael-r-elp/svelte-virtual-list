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
    /**
     * SvelteVirtualList Implementation Journey
     *
     * Evolution & Architecture:
     * 1. Initial Implementation
     *    - Basic virtual scrolling with fixed height items
     *    - Single direction scrolling (top-to-bottom)
     *    - Simple viewport calculations
     *
     * 2. Dynamic Height Enhancement
     *    - Added dynamic height calculation system
     *    - Implemented debounced measurements
     *    - Created height averaging mechanism for performance
     *
     * 3. Bidirectional Scrolling
     *    - Added bottomToTop mode
     *    - Solved complex initialization issues with flexbox
     *    - Implemented careful scroll position management
     *
     * 4. Performance Optimizations
     *    - Added element recycling through keyed each blocks
     *    - Implemented RAF for smooth animations
     *    - Optimized DOM updates with transform translations
     *
     * 5. Stability Improvements
     *    - Added ResizeObserver for responsive updates
     *    - Implemented proper cleanup on component destruction
     *    - Added debug mode for development assistance
     *
     * Technical Challenges Solved:
     * - Bottom-to-top scrolling in flexbox layouts
     * - Dynamic height calculations without layout thrashing
     * - Smooth scrolling on various devices
     * - Memory management for large lists
     * - Browser compatibility issues
     *
     * Current Architecture:
     * - Four-layer DOM structure for optimal performance
     * - State management using Svelte 5's $state
     * - Reactive height and scroll calculations
     * - Configurable buffer zones for smooth scrolling
     */

    import { onMount } from 'svelte'
    import { BROWSER } from 'esm-env'
    import type { SvelteVirtualListDebugInfo, SvelteVirtualListProps } from './types.js'
    import {
        calculateScrollPosition,
        calculateVisibleRange,
        calculateTransformY,
        updateHeightAndScroll as utilsUpdateHeightAndScroll
    } from './utils/virtualList.js'

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
    }: SvelteVirtualListProps = $props()

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

        return calculateVisibleRange(
            scrollTop,
            viewportHeight,
            calculatedItemHeight,
            items.length,
            bufferSize,
            mode
        )
    })

    // Handle scroll updates only in BROWSER
    const handleScroll = () => {
        if (!BROWSER || !viewportElement) return
        scrollTop = viewportElement.scrollTop
    }

    /**
     * Updates the height and scroll position of the virtual list.
     *
     * This function handles two scenarios:
     * 1. Initial setup (critical for bottomToTop mode in flexbox layouts)
     * 2. Subsequent resize events
     *
     * For bottomToTop mode, we need to ensure:
     * - The flexbox layout is fully calculated
     * - The height measurements are accurate
     * - The scroll position starts at the bottom
     *
     * @param immediate - Whether to skip the delay (used for resize events)
     */
    const updateHeightAndScroll = (immediate = false) => {
        if (!initialized && mode === 'bottomToTop') {
            setTimeout(() => {
                if (containerElement) {
                    const initialHeight = containerElement.getBoundingClientRect().height
                    height = initialHeight

                    setTimeout(() => {
                        if (containerElement && viewportElement) {
                            const finalHeight = containerElement.getBoundingClientRect().height
                            height = finalHeight

                            const targetScrollTop = calculateScrollPosition(
                                items.length,
                                calculatedItemHeight,
                                finalHeight
                            )

                            void containerElement.offsetHeight

                            viewportElement.scrollTop = targetScrollTop
                            scrollTop = targetScrollTop

                            requestAnimationFrame(() => {
                                if (viewportElement) {
                                    const currentScroll = viewportElement.scrollTop
                                    if (currentScroll !== scrollTop) {
                                        viewportElement.scrollTop = targetScrollTop
                                        scrollTop = targetScrollTop
                                    }
                                    initialized = true
                                }
                            })
                        }
                    }, 100)
                }
            }, 100)
            return
        }

        utilsUpdateHeightAndScroll(
            {
                initialized,
                mode,
                containerElement,
                viewportElement,
                calculatedItemHeight,
                height,
                scrollTop
            },
            {
                setHeight: (h) => (height = h),
                setScrollTop: (st) => (scrollTop = st),
                setInitialized: (i) => (initialized = i)
            },
            immediate
        )
    }

    onMount(() => {
        if (BROWSER) {
            // Initial setup
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
                style:transform="translateY({calculateTransformY(
                    mode,
                    items.length,
                    visibleItems().end,
                    visibleItems().start,
                    calculatedItemHeight
                )}px)"
            >
                {#each mode === 'bottomToTop' ? items
                          .slice(visibleItems().start, visibleItems().end)
                          .reverse() : items.slice(visibleItems().start, visibleItems().end) as currentItem, i (currentItem?.id ?? i)}
                    {#if debug && i === 0}
                        {@const debugInfo: SvelteVirtualListDebugInfo = {
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
