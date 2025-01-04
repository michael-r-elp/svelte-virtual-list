import type { Snippet } from 'svelte'

export type Mode = 'topToBottom' | 'bottomToTop'

export type Props = {
    items: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    itemHeight: number
    debug?: boolean
    debugFunction?: (_info: DebugInfo) => void
    containerClass?: string
    viewportClass?: string
    contentClass?: string
    itemsClass?: string
    mode?: Mode
    bufferSize?: number
    renderItem: Snippet<[item: any, index: number]> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type DebugInfo = {
    startIndex: number
    endIndex: number
    visibleItemsCount: number
    totalItems: number
}
