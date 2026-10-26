// Escape script delimiters while preserving JSON semantics.
export function safeJsonLd(value) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
