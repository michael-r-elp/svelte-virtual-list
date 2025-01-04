# Svelte Virtual List

[![NPM version](https://img.shields.io/npm/v/@humanspeak/svelte-virtual-list.svg)](https://www.npmjs.com/package/@humanspeak/svelte-virtual-list)
[![Build Status](https://github.com/humanspeak/svelte-virtual-list/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/humanspeak/svelte-virtual-list/actions/workflows/npm-publish.yml)
[![Coverage Status](https://coveralls.io/repos/github/humanspeak/svelte-virtual-list/badge.svg?branch=main)](https://coveralls.io/github/humanspeak/svelte-virtual-list?branch=main)
[![License](https://img.shields.io/npm/l/@humanspeak/svelte-virtual-list.svg)](https://github.com/humanspeak/svelte-virtual-list/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/@humanspeak/svelte-virtual-list.svg)](https://www.npmjs.com/package/@humanspeak/svelte-virtual-list)
[![CodeQL](https://github.com/humanspeak/svelte-virtual-list/actions/workflows/codeql.yml/badge.svg)](https://github.com/humanspeak/svelte-virtual-list/actions/workflows/codeql.yml)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Types](https://img.shields.io/npm/types/@humanspeak/svelte-virtual-list.svg)](https://www.npmjs.com/package/@humanspeak/svelte-virtual-list)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/humanspeak/svelte-virtual-list/graphs/commit-activity)

A virtual list component for Svelte applications. Built for Svelte 5 with TypeScript support.

## Installation

```bash
npm install @humanspeak/svelte-virtual-list
```

## Usage

```svelte
<script lang="ts">
    import SvelteVirtualList from '@humanspeak/svelte-virtual-list'
    import { onMount } from 'svelte'

    type Item = {
        id: number
        text: string
    }

    const items: Item[] = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        text: `Item ${i}`
    }))

    let measureRef: HTMLElement
    let itemHeight = 20 // default height

    onMount(() => {
        if (measureRef) {
            itemHeight = measureRef.getBoundingClientRect().height
        }
    })
</script>

<div class="grid grid-cols-2 gap-8">
    <!-- Top to bottom scrolling -->
    <div>
        <SvelteVirtualList {items} {itemHeight}>
            {#snippet renderItem(item: Item, index: number)}
                <div bind:this={measureRef}>
                    {item.text}
                </div>
            {/snippet}
        </SvelteVirtualList>
    </div>

    <!-- Bottom to top scrolling -->
    <div>
        <SvelteVirtualList {items} {itemHeight} mode="bottomToTop">
            {#snippet renderItem(item: Item, index: number)}
                <div bind:this={measureRef}>
                    {item.text}
                </div>
            {/snippet}
        </SvelteVirtualList>
    </div>
</div>
```

## Props

The VirtualList component accepts the following props:

- `items` - Array of items to render
- `height` - Height of the viewport in pixels
- `itemHeight` - Height of each item in pixels
- `mode` - Scroll direction ('topToBottom' or 'bottomToTop')
- `debug` - Enable debug mode (optional)
- `containerClass` - Custom class for container element (optional)
- `viewportClass` - Custom class for viewport element (optional)
- `contentClass` - Custom class for content element (optional)
- `itemsClass` - Custom class for items wrapper (optional)
- `renderItem` - Snippet function to render each item

## Features

- Efficient rendering of large lists
- TypeScript support
- Customizable styling
- Debug mode for development
- Smooth scrolling with buffer zones
- SSR compatible
- Svelte 5 runes support

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test
```

## Building

```bash
npm run build
```

## License

[MIT](LICENSE)

## Related

- [Svelte](https://svelte.dev) - JavaScript front-end framework
- [Original Component](https://github.com/pablo-abc/svelte-virtual-list) - Original inspiration

Made with ♥ by [Humanspeak](https://humanspeak.com)
