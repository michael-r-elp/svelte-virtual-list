import { sentrySvelteKit } from '@sentry/sveltekit'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        tailwindcss(),
        sentrySvelteKit({
            sourceMapsUploadOptions: {
                org: 'humanspeak',
                project: 'virtuallist-svelte-page'
            }
        }),
        sveltekit()
    ],

    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    }
})
