import { useEffect, useMemo, useState } from 'react'
import Header from '@components/Header';
import Table from '@components/Table';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@components/Tabs';
import FieldsManager from '@components/FieldsManager';
import Button from '@components/Button';
import API from '@service/api';
import { getStorageState, setStorageItem } from '@service/storage';
import { ScrapeType, STORAGE_KEYS } from '@utils/types';
import './App.css'

function App() {
  const [scrapedData, setScrapedData] = useState<Product[]>([]);
  const [fieldsData, setFieldsData] = useState<Field[]>([]);
  const CategoryFieldsData = useMemo(() => fieldsData
    .filter(field => field.scrapeType === ScrapeType.CATEGORY), [fieldsData])
  const [activeTab, setActiveTab] = useState("main");
  const [isLoading, setIsLoading] = useState(true);

  // Load state from Chrome storage on initial mount
  useEffect(() => {
    const loadStateFromStorage = async () => {
      setIsLoading(true);
      try {
        const storedState = await getStorageState();
        console.log({ storedState });
        // if (storedState.scrapedData) {
        //   setScrapedData(storedState.scrapedData);
        // }

        // if (storedState.fieldsData) {
        // setFieldsData(storedState.fieldsData);

        // } else {
        // If no stored fields, fetch from API
        await fetchFields();
        // }

        if (storedState.activeTab) {
          setActiveTab(storedState.activeTab);
        }
      } catch (error) {
        console.error('Error loading state from storage:', error);
        // Fallback to API if storage fails
        await fetchFields();
      } finally {
        setIsLoading(false);
      }
    };

    loadStateFromStorage();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setStorageItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    }
  }, [activeTab, isLoading]);

  // Set up message listener for scraped data
  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const fetchFields = async () => {
    try {
      const { data }: { data: { fields: Field[] } } = await API.get('/fields')
      setFieldsData(data.fields);
      return data.fields;
    } catch (error) {
      console.error('Error fetching fields:', error);
      return [];
    }
  };

  const handleMessage = (message: ScrapedDataMessage) => {
    if (message.type === "SCRAPED_DATA") {
      setScrapedData(message.payload as Product[]);
      setActiveTab('results');
    }
  };

  const initiateScraping = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab.id) {
        console.error('No active tab found');
        return;
      }
      chrome.tabs.sendMessage(tab.id, { type: "MANUAL_SCRAPE", fields: CategoryFieldsData }, (response) => {
        console.log({ response });
      });
    });
  }

  return (
    <div className="w-[400px] min-h-[500px] h-[100vh] bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <Header />
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col mt-2"
        >
          <TabsList className="grid grid-cols-2 mx-4">
            <TabsTrigger value="main">Main</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="fields">Fields</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="flex-1 flex flex-col justify-center px-6">
            <div className="card">
              <Button className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white" onClick={initiateScraping}>
                {scrapedData.length ? 'Scrape again' : 'Scrape tab'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="flex-1 overflow-hidden">
            {!!scrapedData.length &&
              <Table data={scrapedData} fields={fieldsData} />
            }
          </TabsContent>

          <TabsContent value="fields" className="flex-1 overflow-hidden">
            <FieldsManager fieldsData={fieldsData} setFieldsData={setFieldsData} />
          </TabsContent >
        </Tabs >
      )}
    </div >
  )
}

export default App
