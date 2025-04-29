import { useEffect, useMemo, useState } from "react";
import Button from "../Button";
import Input from "../Input";
import Label from "../Label";
import axios from "axios";


interface IFieldsManagerProps {
    fieldsData: Field[];
    setFieldsData: React.Dispatch<React.SetStateAction<Field[]>>;
}

const FieldsManager = ({ fieldsData, setFieldsData }: IFieldsManagerProps) => {
    const [newField, setNewField] = useState<Selector>({ fieldName: '', selector: '' });
    const [draftFieldsData, setDraftFieldsData] = useState<Field[]>([]);

    useEffect(() => {
        setDraftFieldsData(fieldsData);
    }, [fieldsData]);

    const didFieldsChange = useMemo(() => {
        return JSON.stringify(fieldsData) !== JSON.stringify(draftFieldsData);
    }, [fieldsData, draftFieldsData]);

    const onAddField = async () => {
        if (!newField.fieldName || !newField.selector) return;

        try {
            const { data } = await axios.post('http://localhost:3000/fields', { fields: [newField] })
            setFieldsData(fields => ([...fields, { ...newField, _id: data.newId }]))
            setNewField({ fieldName: "", selector: "" });
        } catch (error) {
            console.error(error)
        }
    };

    const onDeleteField = async (fieldId: string | undefined) => {
        if (!fieldId) return
        try {
            await axios.delete('http://localhost:3000/fields', {
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
            const editedFields = draftFieldsData.filter((f, i) => f.fieldName !== fieldsData[i].fieldName || f.selector !== fieldsData[i].selector)
            await axios.post('http://localhost:3000/fields', { fields: editedFields })
            setFieldsData(draftFieldsData)
        } catch (error) {
            console.error(error)
        }

    };

    const onInputChanged = (idx: number) => {
        return (e: any) => {
            const updated = draftFieldsData.map((field, i) =>
                i === idx ? { ...field, selector: e.target.value } : field
            );
            setDraftFieldsData(updated);
            console.log({ updated, draftFieldsData, didFieldsChange })
        }
    }

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

    const fieldRenderer = (field: Field, idx: number) => <div key={idx} className="flex-1 overflow-auto p-4 border rounded-md  my-2">
        <div className="flex justify-between items-start mb-2">
            <div className="font-medium">{field.fieldName}</div>
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
                htmlFor: `selector-${idx}`,
                label: "CSS Selector",
                id: `selector-${idx}`,
                // value,
                defaultValue: field.selector,
                onChange: onInputChanged(idx),
                // placeHolder
            })}
        </div>
    </div>


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

                        <Button
                            onClick={onAddField}
                            className="w-full mt-2 text-white bg-black"
                            disabled={!newField.fieldName || !newField.selector}
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