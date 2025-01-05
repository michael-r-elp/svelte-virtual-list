<script lang="ts">
    import SvelteVirtualList, { type SvelteVirtualListDebugInfo } from '@humanspeak/svelte-virtual-list'
    import * as Card from '$lib/shadcn/components/ui/card/index.js'

    type Item = {
        id: number
        text: string
    }

    const items: Item[] = Array.from({ length: 100000 }, (_, i) => ({ id: i, text: `Item ${i}` }))

    function topToBottomDebug(info: SvelteVirtualListDebugInfo) {
        console.log('topToBottomDebug', info)
    }

    function bottomToTopDebug(info: SvelteVirtualListDebugInfo) {
        console.log('bottomToTopDebug', info)
    }
</script>

<div class="h-full w-full">
    <div class="flex h-full justify-center p-8">
        <div class="grid h-full w-full grid-cols-2 gap-8">
            <div class="h-full">
                <Card.Root class="flex h-full flex-col">
                    <Card.Header>
                        <Card.Title>Top to bottom</Card.Title>
                        <Card.Description>
                            Check the console for debug information (topToBottomDebug)
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="flex flex-1 flex-col">
                        <SvelteVirtualList {items} debug debugFunction={topToBottomDebug}>
                            {#snippet renderItem(item: Item, _index: number)}
                                <div>
                                    {item.text}
                                </div>
                            {/snippet}
                        </SvelteVirtualList>
                    </Card.Content>
                </Card.Root>
            </div>
            <div class="h-auto min-h-max">
                <Card.Root class="flex h-full w-full flex-col">
                    <Card.Header>
                        <Card.Title>Bottom to top</Card.Title>
                        <Card.Description>
                            Check the console for debug information (bottomToTopDebug)
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="flex-1">
                        <SvelteVirtualList {items} mode="bottomToTop" debug debugFunction={bottomToTopDebug}>
                            {#snippet renderItem(item: Item, _index: number)}
                                <div>
                                    {item.text}
                                </div>
                            {/snippet}
                        </SvelteVirtualList>
                    </Card.Content>
                </Card.Root>
            </div>
        </div>
    </div>
</div>
