import { Request, Response,  NextFunction } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import { DeveloperResult } from "../interfaces";

const verifyEmailAvailability = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    
    const email: string = req.body.email

    const queryTemplate: string = `
        SELECT 
            *
        FROM 
            developers 
        WHERE
            email = $1;
    `

    const queryConfig: QueryConfig = {
        text: queryTemplate,
        values: [email]
    }
    const queryResult: DeveloperResult = await client.query(queryConfig)
   
    if(queryResult.rowCount > 0){
        return res.status(409).json({
            message: "Email already exists!"
        })
    }
    
    return next()
}

const verifyDeveloperExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const id: number = parseInt(req.params.id) || req.body.developerId

    const queryTemplate: string = format(
        `
            SELECT
                *
            FROM 
                developers AS d
            WHERE
                d."id" = %s;
        `,
        id
    )

    const queryResult: DeveloperResult = await client.query(queryTemplate)

    if(!queryResult.rowCount){
        return res.status(404).json({
            message: "Developer not found!"
        })
    }

    return next()
}


export {
    verifyEmailAvailability,
    verifyDeveloperExists
}