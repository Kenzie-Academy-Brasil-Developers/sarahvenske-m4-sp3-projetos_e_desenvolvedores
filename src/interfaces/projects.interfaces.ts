import { QueryResult } from "pg" 

//1. Create Project

interface IProjectRequest {
    name: string
    description: string
    estimatedTime: string
    repository: string
    startDate: Date
    endDate?: Date | null
    developerId: number | null
}

interface IProject extends IProjectRequest {
    id: number
}

type ProjectResult = QueryResult<IProject>

//2. Update Project

interface IProjectUpdateRequest {
    name?: string
    description?: string
    estimatedTime?: string
    repository?: string
    startDate?: Date
    endDate?: Date
    developerId?: number | null
}

//3. Technologies

interface ITechnologyRequest {
    name: string
    addedIn: string 
}

interface ITechnology extends ITechnologyRequest{
    id: number
}

type TechnologyResult = QueryResult<ITechnology>

export {
    IProjectRequest,
    ProjectResult,
    IProjectUpdateRequest,
    ITechnologyRequest,
    TechnologyResult
}