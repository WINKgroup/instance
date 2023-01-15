import ConsoleLog from "@winkgroup/console-log"
import Cron from "@winkgroup/cron"
import Db from "@winkgroup/db-mongo"
import Network, { NetworkParams } from "@winkgroup/network"
import { IInstance, InstanceService } from "./common"
import { IInstanceDoc, IInstanceModel, schema } from './model'

export interface InstanceInput extends Partial<NetworkParams> {
    dbUri: string
    name: string
    consoleLog?: ConsoleLog
}

export default class Instance {
    private static singleton:Instance
    consoleLog = new ConsoleLog({ prefix: 'Instance' })
    private cronManager = new Cron(4.5 * 60)
    services = [] as InstanceService[]
    dbUri:string
    name: string
    network: Network

    private constructor(input:InstanceInput) {
        this.name = input.name
        this.dbUri = input.dbUri
        if (input.consoleLog) this.consoleLog = input.consoleLog
        this.network = Network.get(input)
    }

    async getInfo() {
        const networkInfo = await this.network.getInfo()
        const info:IInstance = {
            name: this.name,
            services: this.services,
            ...networkInfo
        }

        return info
    }

    getService(name:string) {
        for (const service of this.services) {
            if (service.name === name) return service
        }
        return null
    }

    getTypeServices(type: string) {
        const services = [] as InstanceService[]
        for (const service of this.services) {
            if (service.type === type) services.push(service)
        }
        return services
    }

    getModel() {
        const db = Db.get(this.dbUri)
        return db.model<IInstanceDoc, IInstanceModel>('instance', schema)
    }

    async upsert() {
        const Model = this.getModel()
        const info = await this.getInfo()

        await Model.findOneAndUpdate({name: info.name}, info, {upsert: true})
    }

    async cron() {
        if (!this.cronManager.tryStartRun()) return
        await this.upsert()
        this.cronManager.runCompleted()
    }

    async onExit() {
        const Model = this.getModel()
        await Model.deleteOne({name: this.name})
    }

    static setup(input:InstanceInput) {
        this.singleton = new Instance(input)
        return this.singleton
    }

    static get() {
        if (!this.singleton) throw new Error('setup required to get Instance object')
        return this.singleton
    }
}