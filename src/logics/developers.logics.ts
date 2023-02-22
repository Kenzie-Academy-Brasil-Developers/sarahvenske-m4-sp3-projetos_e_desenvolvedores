import { Request, Response } from "express"
import format from "pg-format"
import { client } from "../database"
import { 
    InfoResult, 
    DeveloperResult, 
    IInfosRequest, 
    IDeveloperRequest, 
    DeveloperInfoResult, 
    IDeveloperUpdateRequest, 
    IInfoUpdateRequest 
} from "../interfaces"

const validatePostRoute = (payload: any, keys: any): any  =>  {

    const payloadKeys: Array<string> = Object.keys(payload) 
    const expectedKeys: Array<string> = Object.keys(keys) 

    const newPayload: any = {}

    expectedKeys.forEach((key:any) => {
        console.log(payload[key])
        if(!payloadKeys.includes(key) && typeof payload[key] !== keys[key]){
            throw new Error(`Mising required keys!`)
        } 
        newPayload[key] = payload[key]
    })

    return newPayload
    
}

const validatePatchRoute = (payload: any, keys: any): any  => {

    const payloadKeys: Array<string> = Object.keys(payload) 
    const expectedKeys: Array<string> = Object.keys(keys) 

    const newPayload: any = {}

    const check: boolean = payloadKeys.some((key: any) => {
        return expectedKeys.includes(key)   
    })

    if(!check){
        throw new Error(`Missing at least one required key: ${(expectedKeys)}`)
    }
    
    payloadKeys.forEach((key:any) => {
        if(expectedKeys.includes(key)){
            newPayload[key] = payload[key]
        }
    })

    return newPayload
}

const createDeveloper = async (req: Request, res: Response): Promise<Response> => {
    
    try {

        const keys = {
            name: "string",
            email: "string"
        }

        const data: IDeveloperRequest = validatePostRoute(req.body, keys) 
    
        const queryTemplate: string = format(
            `
                INSERT INTO 
                    developers(%I)
                VALUES
                    (%L)
                RETURNING
                    *;
            `,
            Object.keys(data),
            Object.values(data)
        )
        
        const queryResult: DeveloperResult = await client.query(queryTemplate)
    
        return res.status(201).json(queryResult.rows[0])
        
    } catch (error) {
        if(error instanceof Error){
            return res.status(400).json({
                message: error.message
            })
        }
        console.log(error)
        
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

const listOneDeveloper = async (req: Request, res: Response): Promise<Response> => {

    const id: number = parseInt(req.params.id)
    
    const queryTemplate: string = format(
        `   
            SELECT 
                d."id" AS "developerID",
                d."name" AS "developerName",
                d."email" AS "developerEmail",
                d."developerInfoId" AS "developerInfoID",
                di."developerSince" AS "developerInfoDeveloperSince",
                di."preferredOS" AS "developerInfoPreferredOS"
            FROM
                developers AS d
            LEFT JOIN 
                developer_infos AS di ON d."developerInfoId" = di.id  
            WHERE 
                d.id = %s;
        `,
        id
    )

    const queryResult: DeveloperInfoResult = await client.query(queryTemplate)
   
    return res.status(200).json(queryResult.rows)

}

const listAllDevelopers = async (req: Request, res: Response): Promise<Response> => {
    
    const queryString: string = `
            SELECT 
                d.id AS "developerID",
                d."name" AS "developerName",
                d.email AS "developerEmail",
                d."developerInfoId" AS "developerInfoID",
                di."developerSince" AS "developerInfoDeveloperSince",
                di."preferredOS" AS "developerInfoPreferredOS"
            FROM 
                developers AS d 
            LEFT JOIN
                developer_infos AS di ON d."developerInfoId"  = di.id; 
        `

    const queryResult: DeveloperResult = await client.query(queryString) 

    return res.status(200).json(queryResult.rows)

}

const listDeveloperProjects = async (req: Request, res: Response): Promise<Response> => {
    
    const devId: number = parseInt(req.params.id)

    const queryTemplate: string = format(
        `
            SELECT 
                d.id AS "developerID",
                d."name" AS "developerName",
                d.email AS "developerEmail",
                d."developerInfoId" AS "developerInfoID",
                di."developerSince" AS "developerInfoDeveloperSince",
                di."preferredOS" AS "developerInfoPreferredOS",
                p."id" AS "projectID",
                p."name" AS "projectName",
                p."description" AS "projectDescription", 
                p."estimatedTime" AS "projectEstimatedTime",
                p."repository" AS "projectRepository",
                p."startDate" AS "projectStartDate",
                p."endDate" AS "projectEndDate",
                t.id AS "technologyID",
                t."name"AS "technologyName"  
            FROM 
                developers d 
            LEFT JOIN
                developer_infos di ON d."developerInfoId"= d.id 
            LEFT JOIN 
                projects p ON d.id = p."developerId"
            LEFT JOIN 
                projects_technologies pt ON pt."projectId" = p.id 
            LEFT JOIN
                technologies t ON pt."technologyId" = t.id 
            WHERE 
                d.id = %s;
        `,
        devId
    )

    const queryResult: DeveloperResult = await client.query(queryTemplate)

    return res.status(200).json(queryResult.rows)
}

const updateDeveloper = async (req: Request, res: Response): Promise<Response> => {

    try {
        const keys = {
            name: "string",
            email: "string"
        }

        const id: number = parseInt(req.params.id)
        const data: IDeveloperUpdateRequest = validatePatchRoute(req.body, keys) 
    
        const queryTemplate: string = format(
            `
                UPDATE
                    developers
                SET (%I) = ROW (%L)  
                WHERE
                    "id" = %s
                RETURNING
                    *;     
            `,
            Object.keys(data),
            Object.values(data),
            id
        )
    
        const queryResult: DeveloperResult = await client.query(queryTemplate)
    
        return res.status(200).json(queryResult.rows[0])
        
    } catch (error) {
        if(error instanceof Error){
            return res.status(400).json({
                message: error.message
            })
        }
        console.log(error)
        
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
    
}

const deleteDeveloper = async (req: Request, res: Response): Promise<Response> => {

    const id: number = parseInt(req.params.id)

    let queryTemplate: string = format(
        `
            DELETE FROM 
                developers
            WHERE
                "id" = %s;
        `,
        id
    )
   
    await client.query(queryTemplate)

    return res.status(204).send()

}

const createDeveloperInfos = async (req: Request, res: Response): Promise<Response> => {

    try {

        const keys = {
            developerSince: "string",
            preferredOS: "string" 
        }

        const data: IInfosRequest = validatePostRoute(req.body, keys)
        const devId: number = parseInt(req.params.id)

        let queryTemplate: string = format(
            `
            SELECT 
                *
            FROM 
                developers d 
            LEFT JOIN 
                developer_infos di ON d."developerInfoId" = di."id"
            WHERE
                d.id = %s AND (di."developerSince" = %L or di."preferredOS" = %L); 
            `, 
            devId,
            data.developerSince,
            data.preferredOS
        )

        let queryResult: InfoResult  = await client.query(queryTemplate)
        
        if(queryResult.rowCount){
            throw new Error("Developer infos already registered!")
        }

        queryTemplate = format(
            `
                INSERT INTO 
                    developer_infos(%I)
                VALUES
                    (%L)
                RETURNING
                    *;
            `,
            Object.keys(data),
            Object.values(data)
            )
            
        queryResult = await client.query(queryTemplate)
        
        const infoId: number = queryResult.rows[0].id
        
        queryTemplate = format(
            `
                UPDATE
                    developers
                SET
                    "developerInfoId" = %s
                WHERE
                    "id" = %s
                RETURNING
                    *;
            `,
            infoId,
            devId
            )
            
        await client.query(queryTemplate)
                
        return res.status(201).json(queryResult.rows[0])
        
    } catch (error) {
        if(error instanceof Error){
            if(error.message.includes("invalid input value for enum os_type")){
                return res.status(409).json({
                  message: "PreferredOS should be Windows, Linux or MacOS",
                })
            }
            return res.status(400).json({
                message: error.message
            })
        }
        console.log(error)
        
        return res.status(500).json({
            message: 'Internal server error'
        })
    }

}

const updateDeveloperInfos = async (req: Request, res: Response): Promise<Response> => {

    try {
        const devId: number = parseInt(req.params.id)
    
        let queryTemplate: string = format(
            `
                SELECT 
                    *
                FROM 
                    developers
                WHERE
                    "id" = %s;
            `,
            devId
        )
    
        let queryResult: InfoResult  = await client.query(queryTemplate)
        
        const infoId: number = queryResult.rows[0].id
        
        const keys = {
            developerSince: "string",
            preferredOS: "string" 
        }

        const data: IInfoUpdateRequest = validatePatchRoute(req.body, keys) 
    
        queryTemplate = format(
            `
                UPDATE
                    developer_infos
                SET (%I) = ROW (%L)
                WHERE
                    "id" = %s
                RETURNING
                    *;  
            `,
            Object.keys(data),
            Object.values(data),
            infoId,
        )
        
        queryResult = await client.query(queryTemplate)
    
        return res.status(200).json(queryResult.rows[0])
        
    } catch (error) {
        if(error instanceof Error){
            if(error.message.includes("invalid input value for enum os_type")){
                return res.status(409).json({
                  message: "PreferredOS should be Windows, Linux or MacOS",
                })
            }
            return res.status(400).json({
                message: error.message
            })
        }
        console.log(error)
        
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

export {
    createDeveloper,
    listOneDeveloper,
    listDeveloperProjects,
    listAllDevelopers,
    updateDeveloper,
    deleteDeveloper,
    createDeveloperInfos,
    updateDeveloperInfos
}

