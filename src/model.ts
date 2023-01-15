import mongoose, { Document } from 'mongoose'
import { IInstance } from './common'

export interface IInstanceDoc extends IInstance, Document {
}

export interface IInstanceModel extends mongoose.Model<IInstanceDoc> {
}

export const schema = new mongoose.Schema<IInstanceDoc, IInstanceModel>({
    name: { type: String, unique: true, required: true },
    ip: String,
    port: Number,
    hasInternetAccess: Boolean,
    sshAccess: Boolean,
    publicBaseUrl: String,
    services: [{
        name: { type: String, unique: true, required: true },
        type: { type: String, required: true},
        data: Object
    }]
}, { timestamps: { createdAt: false, updatedAt: true } })

schema.index({updatedAt: 1},{expireAfterSeconds: 5 * 60})