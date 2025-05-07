import { Request, Response } from 'express';
import Field, { IField, IFieldDocument } from '../models/Field';

// Store fields data in an array that will be kept up to date
export let fieldsData: IFieldDocument[] = [];

// Function to load fields from database
export const loadFieldsFromDB = async (): Promise<IFieldDocument[]> => {
    try {
        const fields = await Field.find({});
        // Convert Mongoose documents to plain objects to avoid type issues
        fieldsData = JSON.parse(JSON.stringify(fields));
        console.log(`Loaded ${fields.length} fields from database`);
        return fieldsData;
    } catch (error) {
        console.error('Error loading fields from database:', error);
        return [];
    }
};

const getFields = async (req: Request, res: Response) => {
    try {
        // Use the cached fieldsData if available, otherwise fetch from DB
        if (fieldsData.length === 0) {
            await loadFieldsFromDB();
        }
        res.status(200).json({ success: true, count: fieldsData.length, fields: fieldsData });
    } catch (error: any) {
        console.log({ error });
        res.status(400).json({ error });
    }
}

const DeleteField = async (req: Request, res: Response) => {
    const fieldId = req.params.id; // Get the ID from URL parameters
    console.log('Field ID:', fieldId);

    try {
        await Field.findByIdAndDelete(fieldId);
        console.log("Document deleted successfully");
        
        // Update the fieldsData array after deletion
        await loadFieldsFromDB();
        
        res.status(200).json({ success: true, message: 'Field deleted successfully' });

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

        // Update the fieldsData array after modifications
        await loadFieldsFromDB();

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

const UpdateField = async (req: Request, res: Response) => {
    const fieldId = req.params.id;
    const fieldData = req.body;

    try {
        // Validate the field data
        if (!fieldData) {
            res.status(400).json({ success: false, message: 'No field data provided' });
            return;
        }

        // Find and update the field
        const updatedField = await Field.findByIdAndUpdate(
            fieldId,
            {
                $set: {
                    fieldName: fieldData.fieldName,
                    selector: fieldData.selector,
                    contentType: fieldData.contentType,
                    scrapeType: fieldData.scrapeType,
                    isRequired: fieldData.isRequired
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedField) {
            res.status(404).json({ success: false, message: 'Field not found' });
            return;
        }

        // Update the fieldsData array after update
        await loadFieldsFromDB();

        res.status(200).json({
            success: true,
            message: 'Field updated successfully',
            field: updatedField
        });
    } catch (error: any) {
        console.error('Error updating field:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating field',
            error
        });
    }
};

export {
    getFields,
    InsertAndUpdateFields,
    DeleteField,
    UpdateField
};