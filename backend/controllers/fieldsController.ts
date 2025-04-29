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
        const operations = fields.map((field: IField) => ({
            updateOne: {
                filter: { fieldName: field.fieldName },
                update: { $set: field },
                upsert: true,
            }
        }));

        const results = await Field.bulkWrite(operations);

        const updatedFields = await Field.find({
            fieldName: { $in: fields.map((f: IField) => f.fieldName) }
        });

        res.status(200).json({ success: true, updatedFields, newId: results.upsertedIds[0] })
    } catch (error: any) {
        res.status(500).json({ error: 'Server Error' });
    }
}

export {
    getFields,
    InsertAndUpdateFields,
    DeleteField
};