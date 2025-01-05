export type VirtualListState = {
    initialized: boolean
    mode: 'topToBottom' | 'bottomToTop'
    containerElement: HTMLElement | null
    viewportElement: HTMLElement | null
    calculatedItemHeight: number
    height: number
    scrollTop: number
}

export type VirtualListSetters = {
    setHeight: (height: number) => void // eslint-disable-line no-unused-vars
    setScrollTop: (scrollTop: number) => void // eslint-disable-line no-unused-vars
    setInitialized: (initialized: boolean) => void // eslint-disable-line no-unused-vars
}

export function calculateScrollPosition(
    totalItems: number,
    itemHeight: number,
    containerHeight: number
) {
    const totalHeight = totalItems * itemHeight
    return totalHeight - containerHeight
}

export function calculateVisibleRange(
    scrollTop: number,
    viewportHeight: number,
    itemHeight: number,
    totalItems: number,
    bufferSize: number,
    mode: 'topToBottom' | 'bottomToTop'
) {
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

export function calculateTransformY(
    mode: 'topToBottom' | 'bottomToTop',
    totalItems: number,
    visibleEnd: number,
    visibleStart: number,
    itemHeight: number
) {
    return mode === 'bottomToTop'
        ? (totalItems - visibleEnd) * itemHeight
        : visibleStart * itemHeight
}

export function updateHeightAndScroll(
    state: VirtualListState,
    setters: VirtualListSetters,
    immediate = false
) {
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
