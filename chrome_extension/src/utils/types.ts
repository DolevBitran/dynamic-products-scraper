import { ContentType, ScrapeType, STORAGE_KEYS } from './constants';

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