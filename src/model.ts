import mongoose, { Document } from 'mongoose'
import { IInstance, InstanceService } from './common'

export interface IInstanceDoc extends IInstance, Document {
    getService: (name:string) => InstanceService | null
    getTypeServices: (type:string) => InstanceService[]
    getFirstServiceByType: (type: string) => InstanceService | null
}

export interface IInstanceModel extends mongoose.Model<IInstanceDoc> {
}

export const schema = new mongoose.Schema<IInstanceDoc, IInstanceModel>({
    name: { type: String, unique: true, required: true },
    host: { type: String, required: true },
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

schema.methods.getService = function (name:string) {
    const instance = this as IInstanceDoc

    for (const service of instance.services) {
        if (service.name === name) return service
    }
    return null
}

schema.methods.getTypeServices = function(type: string) {
    const instance = this as IInstanceDoc
    
    const services = [] as InstanceService[]
    for (const service of instance.services) {
        if (service.type === type) services.push(service)
    }
    return services
}

schema.methods.getFirstServiceByType = function(type: string) {
    const instance = this as IInstanceDoc

    const services = instance.getTypeServices(type)
    return services.length > 0 ? services[0] : null
}

schema.index({updatedAt: 1},{expireAfterSeconds: 5 * 60})