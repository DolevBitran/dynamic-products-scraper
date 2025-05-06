
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./TableContent";
import Button from "../Button";
import API from "../../api/service";
import { ContentType } from "../../utils/types";

interface IResultsTableProps {
    data: Product[];
    fields: Field[];
}

const ResultsTable = ({ data, fields }: IResultsTableProps) => {
    const [searchTerm, _setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Product | null;
        direction: "ascending" | "descending";
    }>({
        key: null,
        direction: "ascending",
    });
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

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
        const selectedProducts = selectedRows.map((rowIndex) => filteredData[rowIndex]);
        const res = await API.post('/products', { products: selectedProducts })
        console.log(res)
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

            <div className="p-3 border-t flex justify-between items-center text-sm text-gray-500">
                <span>{filteredData.length} products found</span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!selectedRows.length}
                    onClick={onSaveResults}
                    className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
                >Save to DB</Button>
            </div>
        </div>
    )
}

export default ResultsTable;