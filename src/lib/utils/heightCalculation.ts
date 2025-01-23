import { BROWSER } from 'esm-env'
import type { HeightCache } from './types.js'
import { calculateAverageHeight } from './virtualList.js'

/**
 * Calculates and updates the average height of visible items with debouncing.
 *
 * This function optimizes performance by:
 * - Debouncing calculations to prevent excessive DOM reads
 * - Caching item heights to minimize recalculations
 * - Only updating when significant changes are detected
 *
 * Implementation details:
 * - Uses a 200ms debounce timeout
 * - Tracks calculation state to prevent concurrent updates
 * - Caches heights in heightCache for reuse
 * - Only updates if height difference > 1px
 *
 * State interactions:
 * - Updates calculatedItemHeight
 * - Updates lastMeasuredIndex
 * - Modifies heightCache
 * - Uses/sets isCalculatingHeight flag
 *
 * @example
 * ```typescript
 * // Automatically called when items are rendered
 * $effect(() => {
 *     if (BROWSER && itemElements.length > 0 && !isCalculatingHeight) {
 *         calculateAverageHeightDebounced()
 *     }
 * })
 * ```
 *
 * @returns {void}
 */
export const calculateAverageHeightDebounced = (
    isCalculatingHeight: boolean,
    heightUpdateTimeout: ReturnType<typeof setTimeout> | null,
    visibleItemsGetter: () => { start: number; end: number },
    itemElements: HTMLElement[],
    heightCache: HeightCache,
    lastMeasuredIndex: number,
    calculatedItemHeight: number,
    /* trunk-ignore(eslint/no-unused-vars) */
    onUpdate: (result: {
        newHeight: number
        newLastMeasuredIndex: number
        updatedHeightCache: HeightCache
    }) => void,
    debounceTime = 200
): NodeJS.Timeout | null => {
    if (!BROWSER || isCalculatingHeight || heightUpdateTimeout) return null

    const visibleRange = visibleItemsGetter()
    const currentIndex = visibleRange.start

    if (currentIndex === lastMeasuredIndex) return null

    return setTimeout(() => {
        const { newHeight, newLastMeasuredIndex, updatedHeightCache } = calculateAverageHeight(
            itemElements,
            visibleRange,
            heightCache,
            lastMeasuredIndex,
            calculatedItemHeight
        )

        if (Math.abs(newHeight - calculatedItemHeight) > 1) {
            onUpdate({
                newHeight,
                newLastMeasuredIndex,
                updatedHeightCache
            })
        }
    }, debounceTime)
}
