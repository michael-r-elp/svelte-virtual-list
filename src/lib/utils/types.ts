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
