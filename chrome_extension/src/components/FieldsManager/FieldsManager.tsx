import { useEffect, useMemo, useState } from "react";
import Button from "@components/Button";
import Input from "@components/Input";
import Label from "@components/Label";
import Select from "@components/Select";
import API from "@service/api";
import { ContentType, ScrapeType, STORAGE_KEYS } from "@utils/types";
import { getStorageState, setStorageItem } from "@service/storage";

interface IFieldsManagerProps {
    fieldsData: Field[];
    setFieldsData: (fields: Field[]) => void;
}

const FieldsManager = ({ fieldsData, setFieldsData }: IFieldsManagerProps) => {
    const [newField, setNewField] = useState<Field>({ fieldName: '', selector: '', contentType: ContentType.TEXT, scrapeType: ScrapeType.PRODUCT });
    const [draftFieldsData, setDraftFieldsData] = useState<Field[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load stored draft fields and new field on component mount
    useEffect(() => {
        const loadStoredState = async () => {
            try {
                const storedState = await getStorageState();

                // Only load stored draft fields if they exist and fieldsData is not empty
                if (storedState.draftFieldsData && fieldsData.length > 0) {
                    setDraftFieldsData(storedState.draftFieldsData);
                } else {
                    setDraftFieldsData(fieldsData);
                }

                // Load stored new field if it exists
                if (storedState.newField) {
                    setNewField(storedState.newField);
                }

                setIsInitialized(true);
            } catch (error) {
                console.error('Error loading field manager state:', error);
                setDraftFieldsData(fieldsData);
                setIsInitialized(true);
            }
        };

        loadStoredState();
    }, [fieldsData]);

    // Update draft fields when fieldsData changes and no draft exists
    useEffect(() => {
        if (isInitialized && draftFieldsData.length === 0 && fieldsData.length > 0) {
            setDraftFieldsData(fieldsData);
        }
    }, [fieldsData, draftFieldsData.length, isInitialized]);

    const didFieldsChange = useMemo(() => {
        return JSON.stringify(fieldsData) !== JSON.stringify(draftFieldsData);
    }, [fieldsData, draftFieldsData]);

    const onContentTypeChange = (idx: number) => (e: { target: { value: string } }) => {
        const updated = draftFieldsData.map((field, i) =>
            i === idx ? { ...field, contentType: e.target.value as ContentType } : field
        );
        setDraftFieldsData(updated);
        setStorageItem(STORAGE_KEYS.DRAFT_FIELDS_DATA, updated);
    };

    const onScrapeTypeChange = (idx: number) => (e: { target: { value: string } }) => {
        const updated = draftFieldsData.map((field, i) =>
            i === idx ? { ...field, scrapeType: e.target.value as ScrapeType } : field
        );
        setDraftFieldsData(updated);
        setStorageItem(STORAGE_KEYS.DRAFT_FIELDS_DATA, updated);
    };

    const onAddField = async () => {
        if (!newField.fieldName || !newField.selector || !newField.contentType || !newField.scrapeType) return;

        try {
            const { data } = await API.post('/fields', { fields: [newField] })
            const updatedFields = [...fieldsData, { ...newField, _id: data.newId }];
            setFieldsData(updatedFields);

            // Reset new field and update storage
            const emptyField = { fieldName: "", selector: "", contentType: ContentType.TEXT, scrapeType: ScrapeType.CATEGORY };
            setNewField(emptyField);
            setStorageItem(STORAGE_KEYS.NEW_FIELD, emptyField);
            setStorageItem(STORAGE_KEYS.FIELDS_DATA, updatedFields);
        } catch (error) {
            console.error(error)
        }
    };

    const onDeleteField = async (fieldId: string | undefined) => {
        if (!fieldId) return
        try {
            await API.delete('/fields', {
                data: { fieldId },
            });
            const updatedFields = fieldsData.filter(field => field._id !== fieldId);
            setFieldsData(updatedFields);

            // Update draft fields and storage
            const updatedDraft = draftFieldsData.filter(field => field._id !== fieldId);
            setDraftFieldsData(updatedDraft);
            setStorageItem(STORAGE_KEYS.FIELDS_DATA, updatedFields);
            setStorageItem(STORAGE_KEYS.DRAFT_FIELDS_DATA, updatedDraft);
        } catch (error) {
            console.error(error)
        }
    };

    const onSaveFields = async () => {
        if (!didFieldsChange) return

        try {
            const editedFields = draftFieldsData.filter((f, i) => {
                // Make sure we don't go out of bounds
                if (i >= fieldsData.length) return true;

                return f.fieldName !== fieldsData[i].fieldName ||
                    f.selector !== fieldsData[i].selector ||
                    f.contentType !== fieldsData[i].contentType ||
                    f.scrapeType !== fieldsData[i].scrapeType;
            });

            await API.post('/fields', { fields: editedFields })
            setFieldsData(draftFieldsData);
            setStorageItem(STORAGE_KEYS.FIELDS_DATA, draftFieldsData);
        } catch (error) {
            console.error(error)
        }
    };

    const onFieldChanged = (idx: number, fieldName: string) => {
        return (e: any) => {
            const updated = draftFieldsData.map((field, i) =>
                i === idx ? { ...field, [fieldName]: e.target.value } : field
            );
            setDraftFieldsData(updated);
            setStorageItem(STORAGE_KEYS.DRAFT_FIELDS_DATA, updated);
        }
    }

    const onInputChanged = (idx: number) => onFieldChanged(idx, 'selector');
    const onFieldNameChanged = (idx: number) => onFieldChanged(idx, 'fieldName');

    const inputRenderer = ({
        htmlFor,
        label,
        id,
        value,
        defaultValue,
        onChange,
        placeHolder
    }: {
        htmlFor?: string,
        label?: string,
        id?: string,
        value?: string,
        defaultValue?: string,
        onChange?: (e: any) => void,
        placeHolder?: string
    }) => <div>
            <Label htmlFor={htmlFor} className="text-xs text-gray-500">{label}</Label>
            <Input
                id={id}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                className="h-8 text-sm"
                placeholder={placeHolder}
            />
        </div >

    const selectRenderer = ({
        htmlFor,
        label,
        id,
        value,
        onChange,
        options
    }: {
        htmlFor?: string,
        label?: string,
        id?: string,
        value?: string,
        onChange?: (e: any) => void,
        options: { value: string, label: string }[]
    }) => <div>
            <Label htmlFor={htmlFor} className="text-xs text-gray-500">{label}</Label>
            <Select
                id={id}
                value={value}
                onChange={onChange}
                className="h-8 text-sm"
                options={options}
            />
        </div >

    const fieldRenderer = (field: Field, idx: number) => {
        // Use the draft field data to ensure the component reflects the current state
        const draftField = draftFieldsData[idx] || field;

        return (
            <div key={idx} className="flex-1 overflow-auto p-4 border rounded-md my-2">
                <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{draftField.fieldName}</div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteField(field._id)}
                    >
                        X
                    </Button>
                </div>

                <div className="space-y-3">
                    {inputRenderer({
                        htmlFor: `field-name-${idx}`,
                        label: "Field Name",
                        id: `field-name-${idx}`,
                        value: draftField.fieldName,
                        onChange: onFieldNameChanged(idx),
                    })}
                    {inputRenderer({
                        htmlFor: `selector-${idx}`,
                        label: "CSS Selector",
                        id: `selector-${idx}`,
                        value: draftField.selector,
                        onChange: onInputChanged(idx),
                    })}
                    {selectRenderer({
                        htmlFor: `field-content-type-${idx}`,
                        label: "Content Type",
                        id: `field-content-type-${idx}`,
                        value: draftField.contentType,
                        onChange: onContentTypeChange(idx),
                        options: [
                            { value: ContentType.TEXT, label: 'Text' },
                            { value: ContentType.LINK, label: 'Link' },
                            { value: ContentType.IMAGE, label: 'Image' }
                        ]
                    })}
                    {selectRenderer({
                        htmlFor: `field-scrape-type-${idx}`,
                        label: "Scrape Type",
                        id: `field-scrape-type-${idx}`,
                        value: draftField.scrapeType,
                        onChange: onScrapeTypeChange(idx),
                        options: [
                            { value: ScrapeType.CATEGORY, label: 'Category' },
                            { value: ScrapeType.PRODUCT, label: 'Product' }
                        ]
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1">
            <div className="p-3 bg-gray-50 text-start">
                {fieldsData.map(fieldRenderer)}
                <div className="mt-4 p-3 border rounded-md border-dashed">
                    <h4 className="text-sm font-medium mb-3">Add New Field</h4>

                    <div className="space-y-3">

                        {inputRenderer({
                            htmlFor: "new-field-name",
                            label: "Field Name",
                            id: "new-field-name",
                            value: newField.fieldName || "",
                            onChange: (e) => {
                                const updated = { ...newField, fieldName: e.target.value };
                                setNewField(updated);
                                setStorageItem(STORAGE_KEYS.NEW_FIELD, updated);
                            },
                            placeHolder: "e.g., Product Image"
                        })}

                        {inputRenderer({
                            htmlFor: "new-selector",
                            label: "CSS Selector",
                            id: "new-selector",
                            value: newField.selector || "",
                            onChange: (e) => {
                                const updated = { ...newField, selector: e.target.value };
                                setNewField(updated);
                                setStorageItem(STORAGE_KEYS.NEW_FIELD, updated);
                            },
                            placeHolder: "e.g., .product-img>img"
                        })}

                        {selectRenderer({
                            htmlFor: "new-field-content-type",
                            label: "Content Type",
                            id: "new-field-content-type",
                            value: newField.contentType,
                            onChange: (e) => {
                                const updated = { ...newField, contentType: e.target.value as ContentType };
                                setNewField(updated);
                                setStorageItem(STORAGE_KEYS.NEW_FIELD, updated);
                            },
                            options: [
                                { value: ContentType.TEXT, label: 'Text' },
                                { value: ContentType.LINK, label: 'Link' },
                                { value: ContentType.IMAGE, label: 'Image' }
                            ]
                        })}

                        {selectRenderer({
                            htmlFor: "new-field-scrape-type",
                            label: "Scrape Type",
                            id: "new-field-scrape-type",
                            value: newField.scrapeType,
                            onChange: (e) => {
                                const updated = { ...newField, scrapeType: e.target.value as ScrapeType };
                                setNewField(updated);
                                setStorageItem(STORAGE_KEYS.NEW_FIELD, updated);
                            },
                            options: [
                                { value: ScrapeType.CATEGORY, label: 'Category' },
                                { value: ScrapeType.PRODUCT, label: 'Product' }
                            ]
                        })}

                        <Button
                            onClick={onAddField}
                            className="w-full mt-2 text-white bg-black"
                            disabled={!newField.fieldName || !newField.selector || !newField.contentType || !newField.scrapeType}
                            size="sm"
                        >
                            {/* <PlusCircle className="h-4 w-4 mr-2" /> */}
                            Add Field
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-3 border-t flex justify-end">
                <Button onClick={onSaveFields} disabled={!didFieldsChange} className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white">
                    {/* <Save className="h-4 w-4 mr-2" /> */}
                    Save Fields
                </Button>
            </div>
        </div>)
}

export default FieldsManager;