# Svelte Virtual List

[![NPM version](https://img.shields.io/npm/v/@humanspeak/svelte-virtual-list.svg)](https://www.npmjs.com/package/@humanspeak/svelte-virtual-list)
[![Build Status](https://github.com/humanspeak/svelte-virtual-list/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/humanspeak/svelte-virtual-list/actions/workflows/npm-publish.yml)
[![Coverage Status](https://coveralls.io/repos/github/humanspeak/svelte-virtual-list/badge.svg?branch=main)](https://coveralls.io/github/humanspeak/svelte-virtual-list?branch=main)
[![License](https://img.shields.io/npm/l/@humanspeak/svelte-virtual-list.svg)](https://github.com/humanspeak/svelte-virtual-list/blob/main/LICENSE.md)
[![Downloads](https://img.shields.io/npm/dm/@humanspeak/svelte-virtual-list.svg)](https://www.npmjs.com/package/@humanspeak/svelte-virtual-list)
[![CodeQL](https://github.com/humanspeak/svelte-virtual-list/actions/workflows/codeql.yml/badge.svg)](https://github.com/humanspeak/svelte-virtual-list/actions/workflows/codeql.yml)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Types](https://img.shields.io/npm/types/@humanspeak/svelte-virtual-list.svg)](https://www.npmjs.com/package/@humanspeak/svelte-virtual-list)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/humanspeak/svelte-virtual-list/graphs/commit-activity)

A virtual list component for Svelte applications. Built for Svelte 5 with TypeScript support.

## Features

- Efficient rendering of large lists with dynamic heights
- Bi-directional scrolling (top-to-bottom and bottom-to-top)
- Automatic resize handling and content updates
- TypeScript support with full type safety
- SSR compatible with hydration support
- Svelte 5 runes and snippets support
- Customizable styling with class props
- Debug mode for development
- Smooth scrolling with configurable buffer zones

## Installation

```bash
npm install @humanspeak/svelte-virtual-list
```

## Basic Usage

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
        <div>{item.text}</div>
    {/snippet}
</SvelteVirtualList>
```

## Props

| Prop                | Type                             | Default         | Description                                 |
| ------------------- | -------------------------------- | --------------- | ------------------------------------------- |
| `items`             | `T[]`                            | Required        | Array of items to render                    |
| `defaultItemHeight` | `number`                         | `40`            | Initial height for items before measurement |
| `mode`              | `'topToBottom' \| 'bottomToTop'` | `'topToBottom'` | Scroll direction                            |
| `bufferSize`        | `number`                         | `20`            | Number of items to render outside viewport  |
| `debug`             | `boolean`                        | `false`         | Enable debug logging and visualizations     |
| `containerClass`    | `string`                         | `''`            | Class for outer container                   |
| `viewportClass`     | `string`                         | `''`            | Class for scrollable viewport               |
| `contentClass`      | `string`                         | `''`            | Class for content wrapper                   |
| `itemsClass`        | `string`                         | `''`            | Class for items container                   |

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

[MIT](LICENSE.md)

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

## Advanced Usage

### Chat Application Example

```svelte
<script lang="ts">
    import SvelteVirtualList from '@humanspeak/svelte-virtual-list'

    type Message = {
        id: number
        text: string
        timestamp: Date
    }

    const messages: Message[] = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        text: `Message ${i}`,
        timestamp: new Date()
    }))
</script>

<div style="height: 500px;">
    <SvelteVirtualList items={messages} mode="bottomToTop" debug>
        {#snippet renderItem(message)}
            <div class="message-container">
                <p>{message.text}</p>
                <span class="timestamp">
                    {message.timestamp.toLocaleString()}
                </span>
            </div>
        {/snippet}
    </SvelteVirtualList>
</div>

<style>
    .message-container {
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .timestamp {
        font-size: 0.875rem;
        color: #6b7280;
    }
</style>
```

## Performance Considerations

- The `bufferSize` prop affects memory usage and scroll smoothness
- Items are measured and cached for optimal performance
- Dynamic height calculations happen automatically
- Resize observers handle container/content changes
- Virtual DOM updates are batched for efficiency

## Related

- [Svelte](https://svelte.dev) - JavaScript front-end framework

Made with ♥ by [Humanspeak](https://humanspeak.com)
