import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from '@store/index';
// Import selectors
import {
    selectAllFields,
    selectScrapedData,
    selectActiveTab,
} from '@store/selectors';
import Table from '@components/Table';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@components/Tabs';
import FieldsManager from '@components/FieldsManager';
import Button from '@components/Button';
import { ScrapeType } from '@utils/types';

const Dashboard = () => {
    const dispatch = useDispatch<Dispatch>();

    // Get state from Rematch store using selectors
    const fieldsData: Field[] = useSelector(selectAllFields)
    const scrapedData: Product[] = useSelector(selectScrapedData)
    const activeTab: string = useSelector(selectActiveTab)

    const initiateScraping = (scrapeType: ScrapeType = ScrapeType.CATEGORY) => {
        dispatch.products.initiateScraping({ scrapeType });
    }

    return (
        <Tabs
            value={activeTab}
            onValueChange={(value) => dispatch.ui.updateActiveTab(value)}
            className="flex-1 flex flex-col mt-2"
        >
            <TabsList className="grid grid-cols-3 mx-4">
                <TabsTrigger value="main">Main</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="fields">Fields</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="flex-1 flex flex-col justify-center px-6">
                <div className="card">
                    <Button
                        className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white mb-3"
                        onClick={() => initiateScraping(ScrapeType.CATEGORY)}
                    >
                        {scrapedData.length ? 'Scrape Categories' : 'Scrape Categories'}
                    </Button>
                </div>
            </TabsContent>

            <TabsContent value="results" className="flex-1 overflow-hidden">
                {!!scrapedData.length &&
                    <Table data={scrapedData} fields={fieldsData} />
                }
            </TabsContent>

            <TabsContent value="fields" className="flex-1 overflow-hidden">
                <FieldsManager
                    fieldsData={fieldsData}
                    setFieldsData={(fields: Field[]) => dispatch.fields.updateFields(fields)}
                />
            </TabsContent>
        </Tabs>
    )
}

export default Dashboard
