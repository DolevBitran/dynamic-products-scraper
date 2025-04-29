import mongoose, { Schema, model, Document, ObjectId } from 'mongoose';

interface IField {
    fieldName: string;
    selector: string;
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

interface IFieldBaseDocument extends IField, Document {
}

export interface IFieldDocument extends IFieldBaseDocument {
}

export default model<IField>('Field', FieldSchema, 'Fields')
export { IField }