/**
 * Website status constants
 */
export const WEBSITE_STATUS = {
    ACTIVE: 1,
    INACTIVE: 2,
} as const;

/**
 * Content type constants for field types
 */
export const ContentType = {
    TEXT: 'text',
    LINK: 'link',
    IMAGE: 'image',
    PRICE: 'price',
} as const;

/**
 * Scrape type constants for field categorization
 */
export const ScrapeType = {
    CATEGORY: 'category',
    PRODUCT: 'product',
} as const;

/**
 * Product status constants
 */
export const PRODUCT_STATUS = {
    ACTIVE: 'active',
    PENDING: 'pending',
    INACTIVE: 'inactive',
} as const;


export const SIZE = {
    SM: 'small',
    MD: 'medium',
    LG: 'large',
} as const;