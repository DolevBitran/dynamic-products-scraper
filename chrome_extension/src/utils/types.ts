export enum ContentType {
    TEXT = 'text',
    LINK = 'link',
    IMAGE = 'image',
}

export enum ScrapeType {
    CATEGORY = 'category',
    PRODUCT = 'product',
}

export const STORAGE_KEYS = {
    SCRAPED_DATA: 'scrapedData',
    FIELDS_DATA: 'fieldsData',
    ACTIVE_TAB: 'activeTab',
    DRAFT_FIELDS_DATA: 'draftFieldsData',
    NEW_FIELD: 'newField',
} as const;

declare global {
    /*~ Here, declare things that go in the global namespace, or augment
     *~ existing declarations in the global namespace
     */

    type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

    interface StorageState {
        scrapedData?: Product[];
        fieldsData?: Field[];
        activeTab?: string;
        draftFieldsData?: Field[];
        newField?: Field;
    }

    interface ScrapedDataMessage {
        type: "SCRAPED_DATA";
        payload: Product[] | null;
    }

    interface Field {
        _id?: string;
        contentType: ContentType;
        scrapeType: ScrapeType;
        fieldName: string;
        selector: string;
    }

    interface Selector {
        fieldName: string;
        selector: string;
    }

    interface Product {
        _id?: string;
        productId: string | undefined;
        title: string;
        sku: string | null | undefined;
    }
    interface ScrapedDataMessage {
        type: "SCRAPED_DATA";
        payload: Product[] | null;
    }

    interface ManualScrapeMessage {
        type: "MANUAL_SCRAPE";
        fields: Field[]
    }
}