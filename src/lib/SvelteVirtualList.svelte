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
    import { rafSchedule } from './utils/raf.js'

    // Core configuration props with default values
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

    // DOM references and state management
    let containerElement: HTMLElement
    let viewportElement: HTMLElement
    const itemElements = $state<HTMLElement[]>([]) // Tracks rendered item elements for height calculations
    let scrollTop = $state(0) // Current scroll position
    let initialized = $state(false) // Tracks if initial setup is complete
    let height = $state(0) // Container height
    let calculatedItemHeight = $state(defaultEstimatedItemHeight) // Current average item height
    let isCalculatingHeight = $state(false) // Prevents concurrent height calculations
    let lastMeasuredIndex = $state(-1) // Tracks last measured item for optimization
    let heightUpdateTimeout: ReturnType<typeof setTimeout> | null = null
    let resizeObserver: ResizeObserver | null = null
    let heightCache = $state<Record<number, number>>({}) // Cache for item heights
    let isScrolling = $state(false) // Track scroll state
    let chunkSize = $state(50) // Number of items to process at once
    let processedItems = $state(0) // Track initialization progress

    /**
     * Calculates the average height of visible items to improve accuracy of virtual scrolling
     * Uses debouncing to prevent excessive calculations
     */
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
                    // Cache heights and calculate average only for new items
                    validElements.forEach((el, i) => {
                        const itemIndex = visibleRange.start + i
                        if (!heightCache[itemIndex]) {
                            heightCache[itemIndex] = el.getBoundingClientRect().height
                        }
                    })

                    // Use cached heights for average calculation
                    const heights = Object.values(heightCache)
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

    // Trigger height calculation when items are rendered
    $effect(() => {
        if (BROWSER && itemElements.length > 0 && !isCalculatingHeight) {
            calculateAverageHeight()
        }
    })

    // Update container height when element is mounted
    $effect(() => {
        if (BROWSER && containerElement) {
            height = containerElement.getBoundingClientRect().height
        }
    })

    // Special handling for bottom-to-top mode initialization
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
                    // Start at the bottom for bottom-to-top mode
                    viewportElement.scrollTop = totalHeight - height
                    scrollTop = totalHeight - height
                    initialized = true
                }
            }, 50)
        }
    })

    // Calculate which items should be visible based on current scroll position
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

    // Update scroll position when user scrolls
    const handleScroll = () => {
        if (!BROWSER || !viewportElement) return

        if (!isScrolling) {
            isScrolling = true
            rafSchedule(() => {
                scrollTop = viewportElement.scrollTop
                isScrolling = false
            })
        }
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

    // Add new chunked initialization function
    const initializeChunked = async () => {
        if (!items.length) return

        const processChunk = async (startIdx: number) => {
            const endIdx = Math.min(startIdx + chunkSize, items.length)
            processedItems = endIdx

            if (endIdx < items.length) {
                // Schedule next chunk
                setTimeout(() => processChunk(endIdx), 0)
            } else {
                initialized = true
            }
        }

        await processChunk(0)
    }

    // Modify the mount effect to use chunked initialization
    $effect(() => {
        if (BROWSER && items.length > 1000) {
            initializeChunked()
        } else {
            initialized = true
        }
    })

    // Setup and cleanup
    onMount(() => {
        if (BROWSER) {
            // Initial setup of heights and scroll position
            updateHeightAndScroll()

            // Watch for container size changes
            resizeObserver = new ResizeObserver(() => {
                updateHeightAndScroll(true)
            })

            if (containerElement) {
                resizeObserver.observe(containerElement)
            }

            // Cleanup on component destruction
            return () => {
                if (resizeObserver) {
                    resizeObserver.disconnect()
                }
            }
        }
    })
</script>

<!--
    The template uses a four-layer structure:
    1. Container - Overall boundary
    2. Viewport - Scrollable area
    3. Content - Full height container
    4. Items - Translated list of visible items
-->
<div
    id="virtual-list-container"
    data-testid="virtual-list-container"
    class={containerClass ?? 'virtual-list-container'}
    bind:this={containerElement}
>
    <!-- Viewport handles scrolling -->
    <div
        id="virtual-list-viewport"
        data-testid="virtual-list-viewport"
        class={viewportClass ?? 'virtual-list-viewport'}
        bind:this={viewportElement}
        onscroll={handleScroll}
    >
        <!-- Content provides full scrollable height -->
        <div
            id="virtual-list-content"
            class={contentClass ?? 'virtual-list-content'}
            data-testid="virtual-list-content"
            style:height="{Math.max(height, items.length * calculatedItemHeight)}px"
        >
            <!-- Items container is translated to show correct items -->
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
                    <!-- Debug output for first item if debug mode is enabled -->
                    {#if debug && i === 0}
                        {@const debugInfo: SvelteVirtualListDebugInfo = {
                            visibleItemsCount: visibleItems().end - visibleItems().start,
                            startIndex: visibleItems().start,
                            endIndex: visibleItems().end,
                            totalItems: items.length,
                            processedItems
                        }}
                        {debugFunction
                            ? debugFunction(debugInfo)
                            : console.log('Virtual List Debug:', debugInfo)}
                    {/if}
                    <!-- Render each visible item -->
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
    /* Container establishes positioning context */
    .virtual-list-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    /* Viewport handles scrolling with iOS momentum scroll */
    .virtual-list-viewport {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow-y: scroll;
        -webkit-overflow-scrolling: touch;
    }

    /* Content wrapper maintains full scrollable height */
    .virtual-list-content {
        position: relative;
        width: 100%;
        min-height: 100%;
    }

    /* Items wrapper is translated for virtual scrolling */
    .virtual-list-items {
        position: absolute;
        width: 100%;
        left: 0;
        top: 0;
    }
</style>
