/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ExtendableEvent extends Event { waitUntil(promise: Promise<unknown>): void }
