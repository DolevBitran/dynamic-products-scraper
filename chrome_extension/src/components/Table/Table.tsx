
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./TableContent";
import Button from "@components/Button";
import API from "@service/api";
import { ContentType, STORAGE_KEYS } from "@utils/types";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "@store/index";
import { setStorageItem } from "@service/storage";

interface IResultsTableProps {
    data: Product[];
    fields: Field[];
}

const ResultsTable = ({ data, fields }: IResultsTableProps) => {
    const dispatch = useDispatch<Dispatch>();
    // @ts-ignore - auth is available in the state but not typed in IRootState
    const user = useSelector((state: any) => state.auth?.user);
    const [searchTerm, _setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Product | null;
        direction: "ascending" | "descending";
    }>({
        key: null,
        direction: "ascending",
    });
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>("");

    const handleSort = (key: keyof Product | null) => {
        let direction: "ascending" | "descending" = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key] as string;
        const bValue = b[sortConfig.key] as string;

        if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
    });

    const filteredData = sortedData.filter((item) =>
        Object.values(item).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const renderFieldCell = (fieldName: string, val: string) => {
        const field = fields.find(f => f.fieldName === fieldName)

        if (!field) return null

        switch (field.contentType) {
            case ContentType.IMAGE:
                return (
                    <TableCell>
                        <img src={val} width={'100%'} />
                    </TableCell>
                );

            case ContentType.LINK:
                return (
                    <TableCell>
                        <a href={val} target="_blank">Link</a>
                    </TableCell>
                );

            default:
                return <TableCell>{val}</TableCell>;
        }
    }

    const toggleRowSelection = (index: number) => {
        setSelectedRows(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const toggleSelectAll = () => {
        if (selectedRows.length === filteredData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredData.map((_, idx) => idx));
        }
    };

    const onSaveResults = async () => {
        if (!selectedWebsiteId) {
            alert('Please select a website first');
            return;
        }

        const selectedProducts = selectedRows.map((rowIndex) => filteredData[rowIndex]);

        // Add the selected website ID to each product
        const productsWithWebsite = selectedProducts.map(product => ({
            ...product,
            websites: [selectedWebsiteId]
        }));

        try {
            const res = await API.post('/products', { products: productsWithWebsite });
            console.log('Products saved:', res);
            alert('Products saved successfully!');
        } catch (error) {
            console.error('Error saving products:', error);
            alert('Failed to save products. Please try again.');
        }
    }

    const onRemoveSelected = async () => {
        // Get indices of selected rows
        const selectedIndices = [...selectedRows].sort((a, b) => b - a); // Sort in descending order

        // Create a copy of the filtered data
        const updatedData = [...filteredData];

        // Remove selected rows from the data (starting from the end to avoid index shifting)
        selectedIndices.forEach(index => {
            updatedData.splice(index, 1);
        });

        // Update the state and storage
        dispatch.products.setScrapedData(updatedData);
        await setStorageItem(STORAGE_KEYS.SCRAPED_DATA, updatedData);

        // Clear selection
        setSelectedRows([]);
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-gray-50">
                        <TableRow>
                            <TableHead>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </TableHead>
                            {Object.keys(data[0]).map((fieldName, idx) =>
                                <TableHead key={idx} onClick={() => handleSort(fieldName as keyof Product)} className="cursor-pointer">

                                    <div className="flex items-center">
                                        {fieldName}
                                        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                                    </div>
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((product, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(idx)}
                                            onChange={() => toggleRowSelection(idx)}
                                        />
                                    </TableCell>
                                    {
                                        Object.entries(product).map(([fieldName, val]) => renderFieldCell(fieldName, val))
                                    }
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                                    No results found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="p-3 border-t flex flex-col space-y-3 text-sm text-gray-500">
                <div className="flex justify-between items-center">
                    <span>{filteredData.length} products found</span>

                    {/* Website selector */}
                    <div className="flex items-center">
                        <label htmlFor="website-select" className="mr-2 font-medium">Save to website:</label>
                        <select
                            id="website-select"
                            value={selectedWebsiteId}
                            onChange={(e) => setSelectedWebsiteId(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#9b87f5]"
                            disabled={!user?.websites?.length}
                        >
                            <option value="">Select a website</option>
                            {user?.websites?.map((website: { id: string, name: string }) => (
                                <option key={website.id} value={website.id}>
                                    {website.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!selectedRows.length}
                        onClick={onRemoveSelected}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                    >Remove</Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!selectedRows.length || !selectedWebsiteId}
                        onClick={onSaveResults}
                        className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
                    >Save to DB</Button>
                </div>
            </div>
        </div>
    )
}

export default ResultsTable;