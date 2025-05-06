import mongoose, { Schema, model, Document, ObjectId } from 'mongoose';

enum ContentType {
    TEXT = 'text',
    LINK = 'link',
    IMAGE = 'image',
}

enum ScrapeType {
    CATEGORY = 'category',
    PRODUCT = 'product',
}

interface IField {
    fieldName: string;
    selector: string;
    contentType: ContentType;
    scrapeType: ScrapeType;
}

const FieldSchema = new Schema<IField>({
    fieldName: {
        type: String,
        unique: [true, 'field already exists in database'],
        required: [true, 'Must provide field name'],
        // maxlength: [20, 'title can not be more than 20 characters']
    },
    selector: {
        type: String,
        required: [true, 'Must provide selector'],
        trim: true,
        // maxlength: [100, 'title can not be more than 100 characters']
    },
    contentType: {
        type: String,
        enum: Object.values(ContentType),
        required: [true, 'Must provide content type'],
    },
    scrapeType: {
        type: String,
        enum: Object.values(ScrapeType),
        required: [true, 'Must provide scrape type'],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

interface IFieldBaseDocument extends IField, Document {
    _id: string; // Explicitly define _id from Document
}

export interface IFieldDocument extends IFieldBaseDocument {
}

export default model<IField>('Field', FieldSchema, 'Fields')
export { IField, ScrapeType, ContentType }