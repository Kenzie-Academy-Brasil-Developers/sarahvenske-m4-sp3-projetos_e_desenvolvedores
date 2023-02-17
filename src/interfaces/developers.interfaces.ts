import { QueryResult } from "pg"

// 1. Create Developer 

interface IDeveloperRequest {
    name: string
    email: string
    developerInfoId?: number | null
}

interface IDeveloper extends IDeveloperRequest {
    id: number
}

type DeveloperResult = QueryResult<IDeveloper>

// 2. Create Developer Info

enum OperationaSystem {
    Linux,
    Windows,
    MacOS
}

interface IInfosRequest { 
    developerSince: Date
    preferredOS: OperationaSystem
}

interface IInfos extends IInfosRequest {
    id: number
}

type InfoResult = QueryResult<IInfos>

// 3. List One Developer

type DeveloperInfos = IDeveloper & IInfos

type DeveloperInfoResult = QueryResult<DeveloperInfos>

// 4. Update Developer

interface IDeveloperUpdateRequest {
    name?: string
    email?: string
    developerInfoId?: number | null
}

// 5. Update Infos

interface IInfoUpdateRequest {
    developerSince?: Date
    preferredOS?: OperationaSystem
}

export {
    IDeveloperRequest,
    DeveloperResult,
    IInfosRequest,
    InfoResult,
    DeveloperInfoResult,
    IDeveloperUpdateRequest,
    IInfoUpdateRequest
}

