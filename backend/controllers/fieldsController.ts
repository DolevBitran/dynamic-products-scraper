import { Request, Response } from 'express';
import Field, { IField, IFieldDocument } from '../models/Field';


const getFields = async (req: Request, res: Response) => {
    try {
        const fields: IFieldDocument[] = await Field.find({});
        res.status(200).json({ success: true, count: fields.length, fields })
    } catch (error: any) {
        console.log({ error })
        res.status(400).json({ error });
    }
}

const DeleteField = async (req: Request, res: Response) => {
    const { fieldId } = req.body; // This gives you the raw fieldId
    console.log('Field ID:', fieldId);

    try {
        await Field.findByIdAndDelete(fieldId);
        console.log("Document deleted successfully");
        res.status(200).json({ success: true })

    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(400).json({ error });
    }
}

const InsertAndUpdateFields = async (req: Request, res: Response) => {
    const { fields } = req.body

    try {
        // Define a type that extends IField to include _id for the controller context
        type FieldWithId = IField & { _id?: string };
        
        // Handle fields with _id separately from new fields
        const existingFields = fields.filter((field: FieldWithId) => field._id);
        const newFields = fields.filter((field: FieldWithId) => !field._id);
        
        let operations: any[] = [];
        
        // For existing fields, update by _id
        if (existingFields.length > 0) {
            operations = existingFields.map((field: FieldWithId) => ({
                updateOne: {
                    filter: { _id: field._id },
                    update: { 
                        $set: {
                            fieldName: field.fieldName,
                            selector: field.selector,
                            contentType: field.contentType,
                            scrapeType: field.scrapeType
                        } 
                    }
                }
            }));
        }
        
        // For new fields, use upsert with fieldName as the key
        if (newFields.length > 0) {
            const newFieldsOps = newFields.map((field: FieldWithId) => ({
                updateOne: {
                    filter: { fieldName: field.fieldName },
                    update: { $set: field },
                    upsert: true
                }
            }));
            
            operations = [...operations, ...newFieldsOps];
        }

        // Only perform bulkWrite if there are operations
        let results: { upsertedIds: Record<string, any> } = { upsertedIds: {} };
        let updatedFields: IFieldDocument[] = [];
        
        if (operations.length > 0) {
            results = await Field.bulkWrite(operations);
            
            // Get all updated fields
            updatedFields = await Field.find({
                fieldName: { $in: fields.map((f: FieldWithId) => f.fieldName) }
            });
        }

        // Get the first upserted ID if any
        const upsertedIdsKeys = Object.keys(results.upsertedIds);
        const newId = upsertedIdsKeys.length > 0 ? results.upsertedIds[upsertedIdsKeys[0]] : null;

        res.status(200).json({ 
            success: true, 
            updatedFields, 
            newId 
        });
    } catch (error: any) {
        console.error('Error in InsertAndUpdateFields:', error);
        res.status(500).json({ error: error.message || 'Server Error' });
    }
}

export {
    getFields,
    InsertAndUpdateFields,
    DeleteField
};