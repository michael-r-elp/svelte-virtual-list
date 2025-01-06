import type { SvelteVirtualListDebugInfo } from '../types'

/**
 * Determines if debug information should be shown based on current and previous states
 *
 * @param prevRange - Previous visible range
 * @param currentRange - Current visible range
 * @param prevHeight - Previous item height
 * @param currentHeight - Current item height
 * @returns boolean indicating if debug info should be shown
 */
export function shouldShowDebugInfo(
    prevRange: { start: number; end: number } | null,
    currentRange: { start: number; end: number },
    prevHeight: number,
    currentHeight: number
): boolean {
    if (!prevRange) return true

    return (
        prevRange.start !== currentRange.start ||
        prevRange.end !== currentRange.end ||
        prevHeight !== currentHeight
    )
}

/**
 * Creates debug information object for virtual list state
 *
 * @param visibleRange - Current visible range
 * @param totalItems - Total number of items
 * @param processedItems - Number of processed items
 * @param averageItemHeight - Current average item height
 * @returns Debug information object
 */
export function createDebugInfo(
    visibleRange: { start: number; end: number },
    totalItems: number,
    processedItems: number,
    averageItemHeight: number
): SvelteVirtualListDebugInfo {
    return {
        visibleItemsCount: visibleRange.end - visibleRange.start,
        startIndex: visibleRange.start,
        endIndex: visibleRange.end,
        totalItems,
        processedItems,
        averageItemHeight
    }
}
