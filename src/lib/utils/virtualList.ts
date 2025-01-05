import type { SvelteVirtualListMode } from '../types.js'
import type { VirtualListSetters, VirtualListState } from './types.js'

/**
 * Calculates the maximum scroll position for a virtual list.
 *
 * This function determines the maximum scrollable distance by computing the difference
 * between the total content height and the visible container height. This is crucial
 * for maintaining proper scroll boundaries in virtual lists.
 *
 * @param {number} totalItems - The total number of items in the list
 * @param {number} itemHeight - The height of each individual item in pixels
 * @param {number} containerHeight - The visible height of the container in pixels
 * @returns {number} The maximum scroll position in pixels
 */
export const calculateScrollPosition = (
    totalItems: number,
    itemHeight: number,
    containerHeight: number
) => {
    const totalHeight = totalItems * itemHeight
    return totalHeight - containerHeight
}

/**
 * Determines the range of items that should be rendered in the virtual list.
 *
 * This function calculates which items should be visible based on the current scroll position,
 * viewport size, and scroll direction. It includes a buffer zone to enable smooth scrolling
 * and prevent visible gaps during rapid scroll movements.
 *
 * @param {number} scrollTop - Current scroll position in pixels
 * @param {number} viewportHeight - Height of the visible area in pixels
 * @param {number} itemHeight - Height of each list item in pixels
 * @param {number} totalItems - Total number of items in the list
 * @param {number} bufferSize - Number of items to render outside the visible area
 * @param {SvelteVirtualListMode} mode - Scroll direction mode
 * @returns {{ start: number, end: number }} Range of indices to render
 */
export const calculateVisibleRange = (
    scrollTop: number,
    viewportHeight: number,
    itemHeight: number,
    totalItems: number,
    bufferSize: number,
    mode: SvelteVirtualListMode
) => {
    if (mode === 'bottomToTop') {
        const visibleCount = Math.ceil(viewportHeight / itemHeight) + 1
        const bottomIndex = totalItems - Math.floor(scrollTop / itemHeight)
        // Add buffer to both ends
        const start = Math.max(0, bottomIndex - visibleCount - bufferSize)
        const end = Math.min(totalItems, bottomIndex + bufferSize)
        return { start, end }
    } else {
        const start = Math.floor(scrollTop / itemHeight)
        const end = Math.min(totalItems, start + Math.ceil(viewportHeight / itemHeight) + 1)
        // Add buffer to both ends
        return {
            start: Math.max(0, start - bufferSize),
            end: Math.min(totalItems, end + bufferSize)
        }
    }
}

/**
 * Calculates the CSS transform value for positioning the virtual list items.
 *
 * This function determines the vertical offset needed to position the visible items
 * correctly within the viewport, accounting for the scroll direction and current
 * visible range.
 *
 * @param {SvelteVirtualListMode} mode - Scroll direction mode
 * @param {number} totalItems - Total number of items in the list
 * @param {number} visibleEnd - Index of the last visible item
 * @param {number} visibleStart - Index of the first visible item
 * @param {number} itemHeight - Height of each list item in pixels
 * @returns {number} The calculated transform Y value in pixels
 */
export const calculateTransformY = (
    mode: SvelteVirtualListMode,
    totalItems: number,
    visibleEnd: number,
    visibleStart: number,
    itemHeight: number
) => {
    return mode === 'bottomToTop'
        ? (totalItems - visibleEnd) * itemHeight
        : visibleStart * itemHeight
}

/**
 * Updates the virtual list's height and scroll position when necessary.
 *
 * This function handles dynamic updates to the virtual list's dimensions and scroll
 * position, particularly important when the container size changes or when switching
 * scroll directions. When immediate is true, it forces an immediate update of the
 * height and scroll position.
 *
 * @param {VirtualListState} state - Current state of the virtual list
 * @param {VirtualListSetters} setters - State setters for updating list properties
 * @param {boolean} immediate - Whether to perform the update immediately
 */
export const updateHeightAndScroll = (
    state: VirtualListState,
    setters: VirtualListSetters,
    immediate = false
) => {
    const {
        initialized,
        mode,
        containerElement,
        viewportElement,
        calculatedItemHeight,
        scrollTop
    } = state

    const { setHeight, setScrollTop } = setters

    if (immediate) {
        if (containerElement && viewportElement && initialized) {
            const newHeight = containerElement.getBoundingClientRect().height
            setHeight(newHeight)

            if (mode === 'bottomToTop') {
                const visibleIndex = Math.floor(scrollTop / calculatedItemHeight)
                const newScrollTop = visibleIndex * calculatedItemHeight
                viewportElement.scrollTop = newScrollTop
                setScrollTop(newScrollTop)
            }
        }
    }
}

/**
 * Calculates the average height of visible items
 * Uses cached heights to prevent unnecessary recalculations
 */
export const calculateAverageHeight = (
    itemElements: HTMLElement[],
    visibleRange: { start: number },
    heightCache: Record<number, number>,
    lastMeasuredIndex: number,
    currentItemHeight: number
): {
    newHeight: number
    newLastMeasuredIndex: number
    updatedHeightCache: Record<number, number>
} => {
    const validElements = itemElements.filter((el) => el)
    if (validElements.length === 0) {
        return {
            newHeight: currentItemHeight,
            newLastMeasuredIndex: lastMeasuredIndex,
            updatedHeightCache: heightCache
        }
    }

    const newHeightCache = { ...heightCache }

    // Cache heights for new items
    validElements.forEach((el, i) => {
        const itemIndex = visibleRange.start + i
        if (!newHeightCache[itemIndex]) {
            newHeightCache[itemIndex] = el.getBoundingClientRect().height
        }
    })

    // Calculate average from cached heights
    const heights = Object.values(newHeightCache)
    const averageHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length

    return {
        newHeight: averageHeight > 0 && !isNaN(averageHeight) ? averageHeight : currentItemHeight,
        newLastMeasuredIndex: visibleRange.start,
        updatedHeightCache: newHeightCache
    }
}

/**
 * Processes items in chunks for large datasets
 */
export const processChunked = async (
    items: any[],
    chunkSize: number,
    onProgress: (processed: number) => void,
    onComplete: () => void
) => {
    if (!items.length) return

    const processChunk = async (startIdx: number) => {
        const endIdx = Math.min(startIdx + chunkSize, items.length)
        onProgress(endIdx)

        if (endIdx < items.length) {
            setTimeout(() => processChunk(endIdx), 0)
        } else {
            onComplete()
        }
    }

    await processChunk(0)
}
