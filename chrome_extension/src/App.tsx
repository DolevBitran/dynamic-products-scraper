import { useEffect, useState } from 'react'
import Header from './components/Header';
import Table from './components/Table';
import Tabs, { TabsContent, TabsList, TabsTrigger } from './components/Tabs';
import FieldsManager from './components/FieldsManager';
import './App.css'
import Button from './components/Button';
import API from './api/service';

function App() {
  const [scrapedData, setScrapedData] = useState<Product[]>([]);
  const [fieldsData, setFieldsData] = useState<Field[]>([]);
  const [activeTab, setActiveTab] = useState("main");

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const { data }: { data: { fields: Field[] } } = await API.get('/fields')
        setFieldsData(data.fields)
      } catch (error) {
        console.error(error)
      }
    };

    const handleMessage = (message: ScrapedDataMessage) => {
      if (message.type === "SCRAPED_DATA") {
        setScrapedData(message.payload as Product[]);
        setActiveTab('results')
        console.log(message)
      }
    };

    fetchFields()
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const initiateScraping = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab.id) {
        console.error('No active tab found');
        return;
      }
      chrome.tabs.sendMessage(tab.id, { type: "MANUAL_SCRAPE", fields: fieldsData }, (response) => {
        console.log({ response });
      });
    });
  }

  return (
    <div className="w-[400px] min-h-[500px] h-[100vh] bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <Header />

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
    </div >
  )
}

export default App
