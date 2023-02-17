import { Request, Response } from "express"
import format from "pg-format"
import { client } from "../database"
import { IProjectRequest, IProjectUpdateRequest, ITechnologyRequest, ProjectResult, TechnologyResult } from "../interfaces"

const validateCreateProject = (payload: any): IProjectRequest => {
    
    const expectedKeys: Array<string> = ["name", "description", "estimatedTime", "repository", "startDate", "endDate", "developerId"]
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

const validateUpdateProject = (payload: any): IProjectUpdateRequest => {

    const expectedKeys: Array<string> = ["name", "description", "estimatedTime", "repository", "startDate", "endDate", "developerId"]
    const payloadKeys: Array<string> = Object.keys(payload)

    const checkKeys: boolean = payloadKeys.every((key: string) => {
        return expectedKeys.includes(key)
    })

    if(!checkKeys){
        throw new Error("Non required keys detected")
    }

    return payload
 
}


const createProject = async (req: Request, res: Response): Promise<Response> => {   
    
    try {
        const data: IProjectRequest = validateCreateProject(req.body)
    
        const queryTemplate: string = format(
            `
                INSERT INTO 
                    projects(%I)
                VALUES
                    (%L)
                RETURNING
                    *;
            `,
            Object.keys(data),
            Object.values(data)
        )
        
        const queryResult: ProjectResult = await client.query(queryTemplate)
    
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

const listOneProject = async (req: Request, res: Response): Promise<Response> => { 
    
    const projectId: number = parseInt(req.params.id)

    const queryTemplate: string = format(
        `
            SELECT 
                p.id AS "projectID",
                p."name" AS "projectName",
                p."description" AS "projectDescription", 
                p."estimatedTime" AS "projectEstimatedTime",
                p.repository AS "projectRepository",
                p."startDate" AS "projectStartDate",
                p."endDate" AS "projectEndDate",
                p."developerId" AS "projectDeveloperID",
                t.id AS "technologyID",
                t."name"AS "technologyName"
            FROM 
                projects AS p 
            LEFT JOIN
                projects_technologies AS pt ON p.id  = pt."projectId" 
            LEFT JOIN
                technologies AS t ON pt."technologyId" = t.id
            WHERE
                p.id = %s;
        `,
        projectId
    )
    
    const queryResult: ProjectResult = await client.query(queryTemplate)

    return res.status(200).json(queryResult.rows[0])
}

const listAllProjects = async (req: Request, res: Response): Promise<Response> => {   
    
    const queryString: string = `
        SELECT 
            p.id AS "projectID",
            p."name" AS "projectName",
            p."description" AS "projectDescription", 
            p."estimatedTime" AS "projectEstimatedTime",
            p.repository AS "projectRepository",
            p."startDate" AS "projectStartDate",
            p."endDate" AS "projectEndDate",
            p."developerId" AS "projectDeveloperID",
            t.id AS "technologyID",
            t."name"AS "technologyName"
        FROM
            projects AS p  
        LEFT JOIN
            projects_technologies AS pt ON p.id  = pt."projectId" 
        LEFT JOIN
            technologies AS t ON pt."technologyId" = t.id;
        `
    
    const queryResult: ProjectResult = await client.query(queryString)
   
    return res.status(200).json(queryResult.rows)
}

const updateProject = async (req: Request, res: Response): Promise<Response> => {  
    
    try {
        const projectId: number = parseInt(req.params.id)
        const data: IProjectUpdateRequest = validateUpdateProject(req.body)
        
        const queryTemplate: string = format(
            `
                UPDATE
                    projects
                SET (%I) = ROW (%L)  
                WHERE
                    "id" = %s
                RETURNING
                    *;         
            `,
            Object.keys(data),
            Object.values(data),
            projectId
        )
        
        const queryResult: ProjectResult = await client.query(queryTemplate)
       
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

const deleteProject = async (req: Request, res: Response): Promise<Response> => { 
    
    const projectId: number = parseInt(req.params.id)

    let queryTemplate: string = format(
        `
            DELETE FROM 
                projects
            WHERE
                "id" = %s;
        `,
        projectId
    )
   
    await client.query(queryTemplate)

    return res.status(204).send()

}

const createTechnology = async (req: Request, res: Response): Promise<Response> => {   
    
    const projectId: number = parseInt(req.params.id)
    const name: string = req.body.name
    
    let queryTemplate: string = format(
        `
            SELECT
                "id"
            FROM
                technologies    
            WHERE
                "name" = '%s';   
        `,
        name
    )

    let queryResult: TechnologyResult = await client.query(queryTemplate)

    const techId: number = queryResult.rows[0].id
   
    queryTemplate = format(
        `
        SELECT 
            *
        FROM 
            technologies AS t
        LEFT JOIN
            projects_technologies AS pt ON t.id = pt."technologyId" 
        LEFT JOIN 
            projects AS p ON pt."projectId" = p.id
        WHERE 
            t."name" = '%s' AND p.id = %s;
        `,
        name,
        techId
    )

    queryResult = await client.query(queryTemplate)
    
    if(queryResult.rowCount){
        return res.status(404).json({
            message: "Technology already created to the Project!"
        })
    }

    const addedIn: string = req.body.addedIn

    queryTemplate = format(
        `
            INSERT INTO
                projects_technologies("addedIn", "technologyId", "projectId")
            VALUES 
                (%L, %s, %s)
            RETURNING
                *;
        `,
    addedIn,
    techId,
    projectId
    )

    queryResult = await client.query(queryTemplate)

    queryTemplate = format(
        `
        SELECT 
            t."id" AS "technologyID",
            t."name"AS "technologyName",
            p."id" AS "projectID",
            p."name" AS "projectName",
            p."description" AS "projectDescription", 
            p."estimatedTime" AS "projectEstimatedTime",
            p."repository" AS "projectRepository",
            p."startDate" AS "projectStartDate",
            p."endDate" AS "projectEndDate"
        FROM 
            technologies AS t
        LEFT JOIN
            projects_technologies AS pt ON t.id = pt."technologyId" 
        LEFT JOIN 
            projects AS p ON pt."projectId" = p.id
        WHERE 
            t."name" = '%s' AND p.id = %s;
        `,
        name,
        techId
    )

    queryResult = await client.query(queryTemplate)

    return res.status(200).json(queryResult)
}

const deleteTechnology = async (req: Request, res: Response): Promise<Response> => {   

    const projectId: number = parseInt(req.params.id)
    const name: string = req.params.name
    
    let queryTemplate: string = format(
        `
            SELECT
                "id"
            FROM
                technologies    
            WHERE
                "name" = '%s';   
        `,
        name
    )

    let queryResult: TechnologyResult = await client.query(queryTemplate)

    const techId: number = queryResult.rows[0].id
   
    queryTemplate = format(
        `
        SELECT 
            *
        FROM 
            technologies AS t
        LEFT JOIN
            projects_technologies AS pt ON t.id = pt."technologyId" 
        LEFT JOIN 
            projects AS p ON pt."projectId" = p.id
        WHERE 
            t."name" = '%s' AND p.id = %s;
        `,
        name,
        techId
    )

    queryResult = await client.query(queryTemplate)
    
    if(!queryResult.rowCount){
        return res.status(404).json({
            message: `Technology ${name} not found `
        })
    }

    queryTemplate = format(
        `
        DELETE FROM
            projects_technologies 
        WHERE
            "technologyId" = %s AND "projectId" = %s; 
        `,
        techId,
        projectId
    )

    await client.query(queryTemplate)

    return res.status(204).send()

}

export {
    createProject,
    listOneProject,
    listAllProjects,
    updateProject,
    deleteProject,
    createTechnology,
    deleteTechnology
}