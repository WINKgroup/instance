import Cron from "@winkgroup/cron"
import Db from "@winkgroup/db-mongo"
import Network from "@winkgroup/network"
import { IInstanceDoc, IInstanceModel, schema } from './model'

export interface SetupInput {
    network?: Network
    dbUri: string
    name: string
    host: string
}

export default class Instance {
    static dbUri = ''
    static doc:IInstanceDoc
    static cronManager = new Cron(4.5 * 60)
    static network:Network

    static getModel() {
        const db = Db.get(this.dbUri)
        return db.model<IInstanceDoc, IInstanceModel>('instance', schema)
    }

    static async updateDocInfo() {
        const networkInfo = await this.network.getInfo()
        this.doc.hasInternetAccess = networkInfo.hasInternetAccess
        this.doc.sshAccess = networkInfo.sshAccess
    }

    static async upsert() {
        await this.updateDocInfo()
        await this.doc.save()
    }

    static async cron() {
        if (!this.cronManager.tryStartRun()) return
        await this.upsert()
        this.cronManager.runCompleted()
    }

    static async onExit() {
        await this.doc.delete()
    }

    static async setup(input:SetupInput) {
        this.dbUri = input.dbUri
        const Model = this.getModel()
        this.network = input.network ? input.network : Network.get()

        let doc = await Model.findOne({name: input.name})
        if (!doc) {
            this.doc = new Model({
                ...this.network.getInfo(),
                name: input.name,
                host: input.host,
                services: []
            })
        } else {
            this.updateDocInfo()
        }
        await this.doc.save()
        return this.doc
    }
}