import { describe, expect, it } from 'vitest'
import type { VirtualListSetters, VirtualListState } from './types.js'
import {
    calculateScrollPosition,
    calculateTransformY,
    calculateVisibleRange,
    updateHeightAndScroll
} from './virtualList.js'

describe('calculateScrollPosition', () => {
    it('should calculate correct scroll position for basic case', () => {
        expect(calculateScrollPosition(100, 30, 300)).toBe(2700)
    })

    it('should handle edge case with zero items', () => {
        expect(calculateScrollPosition(0, 30, 300)).toBe(-300)
    })

    it('should handle case when container is larger than content', () => {
        expect(calculateScrollPosition(5, 30, 300)).toBe(-150)
    })
})

describe('calculateVisibleRange', () => {
    it('should calculate correct range for top-to-bottom mode', () => {
        const result = calculateVisibleRange(100, 300, 30, 100, 2, 'topToBottom')
        expect(result).toEqual({
            start: 1, // (100/30 - 2) rounded down
            end: 16 // (floor(100/30) + ceil(300/30) + 1 + 2) = 3 + 10 + 1 + 2
        })
    })

    it('should calculate correct range for bottom-to-top mode', () => {
        const result = calculateVisibleRange(100, 300, 30, 100, 2, 'bottomToTop')
        expect(result).toEqual({
            start: 84, // (100 - ceil(300/30) - ceil(100/30) - 2)
            end: 99 // (100 - ceil(100/30) + 2)
        })
    })

    it('should handle edge cases with buffer exceeding bounds', () => {
        const result = calculateVisibleRange(0, 300, 30, 10, 5, 'topToBottom')
        expect(result).toEqual({
            start: 0,
            end: 10
        })
    })
})

describe('calculateTransformY', () => {
    it('should calculate transform for top-to-bottom mode', () => {
        expect(calculateTransformY('topToBottom', 100, 20, 5, 30)).toBe(150)
    })

    it('should calculate transform for bottom-to-top mode', () => {
        expect(calculateTransformY('bottomToTop', 100, 20, 5, 30)).toBe(2400)
    })

    it('should handle edge case with zero visible items', () => {
        expect(calculateTransformY('topToBottom', 100, 0, 0, 30)).toBe(0)
    })
})

describe('updateHeightAndScroll', () => {
    it('should not update when immediate is false', () => {
        const state: VirtualListState = {
            initialized: true,
            mode: 'topToBottom',
            containerElement: null,
            viewportElement: null,
            calculatedItemHeight: 30,
            scrollTop: 100,
            height: 0
        }
        const setters: VirtualListSetters = {
            setHeight: vi.fn(),
            setScrollTop: vi.fn(),
            setInitialized: vi.fn()
        }

        updateHeightAndScroll(state, setters, false)
        expect(setters.setHeight).not.toHaveBeenCalled()
        expect(setters.setScrollTop).not.toHaveBeenCalled()
        expect(setters.setInitialized).not.toHaveBeenCalled()
    })

    it('should update height and scroll for bottom-to-top mode when immediate is true', () => {
        const mockContainerElement = {
            getBoundingClientRect: () => ({ height: 500 })
        }
        const mockViewportElement = {
            scrollTop: 0
        }

        const state: VirtualListState = {
            initialized: true,
            mode: 'bottomToTop',
            containerElement: mockContainerElement as any,
            viewportElement: mockViewportElement as any,
            calculatedItemHeight: 30,
            scrollTop: 90,
            height: 0
        }

        const setters: VirtualListSetters = {
            setHeight: vi.fn(),
            setScrollTop: vi.fn(),
            setInitialized: vi.fn()
        }

        updateHeightAndScroll(state, setters, true)
        expect(setters.setHeight).toHaveBeenCalledWith(500)
        expect(setters.setScrollTop).toHaveBeenCalledWith(90)
        expect(setters.setInitialized).not.toHaveBeenCalled()
    })
})
