import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/svelte'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import SvelteVirtualList from './SvelteVirtualList.svelte'

beforeEach(() => {
    vi.useFakeTimers()
})

describe('testing initialization', () => {
    test('accepts pre-processed tokens as source', async () => {
        render(SvelteVirtualList)

        // Wait for all timers and effects to settle
        await vi.runAllTimersAsync()

        // Use findByText instead of getByText to handle async rendering
        const element = await screen.findByTestId('virtual-list-viewport')
        expect(element).toBeInTheDocument()
        expect(element.nodeName).toBe('DIV')
    })
})
