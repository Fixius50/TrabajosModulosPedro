import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
    cleanup()
})

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString()
        },
        removeItem: (key: string) => {
            delete store[key]
        },
        clear: () => {
            store = {}
        },
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
})

// Mock fetch globally
global.fetch = vi.fn()

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    error: vi.fn(),
    warn: vi.fn(),
}
