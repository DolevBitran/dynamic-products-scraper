const SELECTORS = {
  PRODUCTS: '.type-product',
}

const findElement = (selectors: string[], elementScope: Document | Element = document) => {
  for (const selector of selectors) {
    const element = elementScope.querySelector(selector);
    if (element) {
      return element; // Return the first valid element
    }
  }
  return null; // Return null if no element is found
};

function scrapePage(fields: Field[]): void {
  let products: Product[] | null = null

  try {
    const productElements = Array.from(document.querySelectorAll(SELECTORS.PRODUCTS))
    if (productElements.length) {
      products = productElements.map(el => {
        const scrapedFields = fields.map(field => {
          const fieldSelectors = field.selector.split(' ')
          const fieldEl = findElement(fieldSelectors, el)

          if (fieldEl) {
            const content = fieldEl.textContent
            const imageContent = (fieldEl as HTMLImageElement).currentSrc || window.getComputedStyle(fieldEl).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1]
            const linkContent = fieldEl.getAttribute("href")
            const contentMap: { [key: string]: string | null | undefined } = {
              image: imageContent,
              photo: imageContent,
              url: linkContent,
              link: linkContent,
            };
            return { [field.fieldName]: contentMap[field.fieldName] || content }
          }
          return { [field.fieldName]: undefined }
        })
        return Object.assign({}, ...scrapedFields)
      })
    }
  } catch {
    console.log('products not found.')
  }

  const message: ScrapedDataMessage = { type: "SCRAPED_DATA", payload: products };
  chrome.runtime.sendMessage(message);
}

chrome.runtime.onMessage.addListener(
  (message: ManualScrapeMessage, _sender, sendResponse) => {
    if (message.type === "MANUAL_SCRAPE") {
      scrapePage(message.fields);
      sendResponse({ status: "Scraping triggered", fields: message.fields });
    }
  }
);