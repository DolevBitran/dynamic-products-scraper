import { useEffect, useMemo, useState } from "react";
import Button from "../Button";
import Input from "../Input";
import Label from "../Label";
import Select from "../Select";
import API from "../../api/service";
import { ContentType, ScrapeType } from "../../utils/types";

interface IFieldsManagerProps {
    fieldsData: Field[];
    setFieldsData: React.Dispatch<React.SetStateAction<Field[]>>;
}

const FieldsManager = ({ fieldsData, setFieldsData }: IFieldsManagerProps) => {
    const [newField, setNewField] = useState<Field>({ fieldName: '', selector: '', contentType: ContentType.TEXT, scrapeType: ScrapeType.PRODUCT });
    const [draftFieldsData, setDraftFieldsData] = useState<Field[]>([]);

    useEffect(() => {
        setDraftFieldsData(fieldsData);
    }, [fieldsData]);

    const didFieldsChange = useMemo(() => {
        return JSON.stringify(fieldsData) !== JSON.stringify(draftFieldsData);
    }, [fieldsData, draftFieldsData]);

    const onContentTypeChange = (idx: number) => (e: { target: { value: string } }) => {
        const updated = draftFieldsData.map((field, i) =>
            i === idx ? { ...field, contentType: e.target.value as ContentType } : field
        );
        setDraftFieldsData(updated);
    };

    const onScrapeTypeChange = (idx: number) => (e: { target: { value: string } }) => {
        const updated = draftFieldsData.map((field, i) =>
            i === idx ? { ...field, scrapeType: e.target.value as ScrapeType } : field
        );
        setDraftFieldsData(updated);
    };
    const onAddField = async () => {
        if (!newField.fieldName || !newField.selector || !newField.contentType || !newField.scrapeType) return;

        try {
            const { data } = await API.post('/fields', { fields: [newField] })
            setFieldsData(fields => ([...fields, { ...newField, _id: data.newId }]))
            setNewField({ fieldName: "", selector: "", contentType: ContentType.TEXT, scrapeType: ScrapeType.CATEGORY });
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
            setFieldsData(fields => fields.filter(field => field._id !== fieldId))
        } catch (error) {
            console.error(error)
        }
    };

    const onSaveFields = async () => {
        if (!didFieldsChange) return

        try {
            const editedFields = draftFieldsData.filter((f, i) => f.fieldName !== fieldsData[i].fieldName || f.selector !== fieldsData[i].selector || f.contentType !== fieldsData[i].contentType || f.scrapeType !== fieldsData[i].scrapeType)
            await API.post('/fields', { fields: editedFields })
            setFieldsData(draftFieldsData)
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
            console.log({ updated, draftFieldsData, didFieldsChange })
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
                            onChange: (e) => setNewField(newField => ({ ...newField, fieldName: e.target.value })),
                            placeHolder: "e.g., Product Image"
                        })}

                        {inputRenderer({
                            htmlFor: "new-selector",
                            label: "CSS Selector",
                            id: "new-selector",
                            value: newField.selector || "",
                            onChange: (e) => setNewField(newField => ({ ...newField, selector: e.target.value })),
                            placeHolder: "e.g., .product-img>img"
                        })}

                        {selectRenderer({
                            htmlFor: "new-field-content-type",
                            label: "Content Type",
                            id: "new-field-content-type",
                            value: newField.contentType,
                            onChange: (e) => setNewField(newField => ({ ...newField, contentType: e.target.value as ContentType })),
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
                            onChange: (e) => setNewField(newField => ({ ...newField, scrapeType: e.target.value as ScrapeType })),
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