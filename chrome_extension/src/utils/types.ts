declare global {
    /*~ Here, declare things that go in the global namespace, or augment
     *~ existing declarations in the global namespace
     */


    interface ScrapedDataMessage {
        type: "SCRAPED_DATA";
        payload: Product[] | null;
    }

    interface Field {
        _id?: string;
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