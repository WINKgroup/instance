import { NetworkInfo, NetworkParams } from "@winkgroup/network"

export interface InstanceService {
    name: string
    type: string
    data: object
}

export interface IInstance extends NetworkInfo {
    name: string
    host: string
    services: InstanceService[]
}
