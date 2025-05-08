/**
 * Website status constants
 */
export const WEBSITE_STATUS = {
    ACTIVE: 1,
    INACTIVE: 2,
} as const;

/**
 * Content type enum for field types
 */
export enum ContentType {
    TEXT = 'text',
    LINK = 'link',
    IMAGE = 'image',
}

/**
 * Scrape type enum for field categorization
 */
export enum ScrapeType {
    CATEGORY = 'category',
    PRODUCT = 'product',
}

/**
 * Storage keys for Chrome extension storage
 */
export const STORAGE_KEYS = {
    SCRAPED_DATA: 'scrapedData',
    FIELDS_DATA: 'fieldsData',
    ACTIVE_TAB: 'activeTab',
    DRAFT_FIELDS_DATA: 'draftFieldsData',
    NEW_FIELD: 'newField',
} as const;

/**
 * Message types for communication between content script and extension
 */
export const MESSAGE_TYPES = {
    SCRAPED_DATA: 'SCRAPED_DATA',
    MANUAL_SCRAPE: 'MANUAL_SCRAPE',
} as const;