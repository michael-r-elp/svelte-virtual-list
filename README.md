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

## Dependencies

- [esm-env](https://github.com/benmccann/esm-env) - svelte5 suggested environment detecting

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
</script>

<div class="grid grid-cols-2 gap-8">
    <!-- Top to bottom scrolling -->
    <div>
        <SvelteVirtualList {items}>
            {#snippet renderItem(item: Item, index: number)}
                <div>
                    {item.text}
                </div>
            {/snippet}
        </SvelteVirtualList>
    </div>

    <!-- Bottom to top scrolling -->
    <div>
        <SvelteVirtualList {items} mode="bottomToTop">
            {#snippet renderItem(item: Item, index: number)}
                <div>
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
- `defaultItemHeight` - Initial height of each item in pixels (optional, defaults to 40)
- `mode` - Scroll direction ('topToBottom' or 'bottomToTop')
- `bufferSize` - Number of items to render outside the visible area (optional, defaults to 20)
- `debug` - Enable debug mode (optional)
- `containerClass` - Custom class for container element (optional)
- `viewportClass` - Custom class for viewport element (optional)
- `contentClass` - Custom class for content element (optional)
- `itemsClass` - Custom class for items wrapper (optional)
- `renderItem` - Snippet function to render each item

Note: The component will automatically calculate the average item height based on rendered items, using `defaultItemHeight` only as an initial value until real measurements are available.

### Buffer Size

The `bufferSize` prop determines how many additional items are rendered outside the visible area. A larger buffer:

- Reduces the chance of seeing blank spaces during fast scrolling
- Provides smoother scrolling experience
- Increases memory usage (as more items are rendered)

Default value is 20 items, which provides a good balance between performance and smoothness.

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

## Key Features

- Dynamic item height handling - no fixed height required
- Bi-directional scrolling support (top-to-bottom and bottom-to-top)
- Automatic resize handling for dynamic content
- Efficient rendering of large lists
- TypeScript support
- Customizable styling
- Debug mode for development
- Smooth scrolling with buffer zones
- SSR compatible
- Svelte 5 runes support

## Usage Examples

### Basic Usage

### Default display

```svelte
<script lang="ts">
    import SvelteVirtualList from '@humanspeak/svelte-virtual-list'

    const items = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        text: `Item ${i}`
    }))
</script>

<SvelteVirtualList {items}>
    {#snippet renderItem(item)}
        <div>
            {item.text}
        </div>
    {/snippet}
</SvelteVirtualList>
```

### Bottom-to-Top Scrolling

The component supports reverse scrolling, which is useful for chat applications or logs:

```svelte
<SvelteVirtualList {items} mode="bottomToTop">
    {#snippet renderItem(item)}
        <div>{item.text}</div>
    {/snippet}
</SvelteVirtualList>
```

## Advanced Features

### Auto-resize Handling

The component automatically handles:

- Dynamic content changes within items
- Window resize events
- Container resize events
- Dynamic height calculations

No manual intervention is needed when item contents or dimensions change.

## Related

- [Svelte](https://svelte.dev) - JavaScript front-end framework

Made with ♥ by [Humanspeak](https://humanspeak.com)
