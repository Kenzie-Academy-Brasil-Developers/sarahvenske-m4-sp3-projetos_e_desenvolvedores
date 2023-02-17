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

const validateCreateDeveloper = (payload: any): IDeveloperRequest => {

    const expectedKeys: Array<string> = ["name", "email", "developerInfoId"]
    const payloadKeys: Array<string> = Object.keys(payload)

    const checkKeys: boolean = expectedKeys.every((key: string) => {
        return payloadKeys.includes(key)
    })

    if(!checkKeys){
        throw new Error(`Required keys are ${expectedKeys}`)
    }

    const checkUnexpectedKeys: boolean = payloadKeys.every((key: string) => {
        return expectedKeys.includes(key)
    })

    if(!checkUnexpectedKeys){
        throw new Error("Non required keys detected")
    }

    return payload

}

const validateUpdateDeveloper = (payload: any): IDeveloperRequest => {

    const expectedKeys: Array<string> = ["name", "email", "developerInfoId"]
    const payloadKeys: Array<string> = Object.keys(payload)

    const checkKeys: boolean = payloadKeys.every((key: string) => {
        return expectedKeys.includes(key)
    })

    if(!checkKeys){
        throw new Error("Non required keys detected")
    }

    return payload
}

const validateCreateInfo = (payload: any): IInfosRequest => {

    const expectedKeys: Array<string> = ["developerSince", "preferredOS"]
    const payloadKeys: Array<string> = Object.keys(payload)

    const checkKeys: boolean = expectedKeys.every((key: string) => {
        return payloadKeys.includes(key)
    })

    if(!checkKeys){
        throw new Error(`Required keys are ${expectedKeys}`)
    }

    const checkUnexpectedKeys: boolean = payloadKeys.every((key: string) => {
        return expectedKeys.includes(key)
    })

    if(!checkUnexpectedKeys){
        throw new Error("Non required keys detected")
    }

    return payload
}

const updateCreateInfo = (payload: any): IInfosRequest => {

    const expectedKeys: Array<string> = ["developerSince", "preferredOS"]
    const payloadKeys: Array<string> = Object.keys(payload)

    const checkKeys: boolean = payloadKeys.every((key: string) => {
        return expectedKeys.includes(key)
    })

    if(!checkKeys){
        throw new Error("Non required keys detected")
    }

    return payload
 
}

const createDeveloper = async (req: Request, res: Response): Promise<Response> => {
    
    try {
        const data: IDeveloperRequest = validateCreateDeveloper(req.body) 
    
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
        const id: number = parseInt(req.params.id)
        const data: IDeveloperUpdateRequest = validateUpdateDeveloper(req.body) 
    
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
        const data: IInfosRequest = validateCreateInfo(req.body)
        
        let queryTemplate: string = format(
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
            
        const queryResult: InfoResult  = await client.query(queryTemplate)
        
        const infoId: number = queryResult.rows[0].id
        const devId: number = parseInt(req.params.id)
        
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
        
        const data: IInfoUpdateRequest = updateCreateInfo(req.body) 
    
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

