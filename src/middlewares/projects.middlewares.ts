import { Request, Response,  NextFunction } from "express";
import format from "pg-format";
import { client } from "../database";
import { DeveloperResult, ProjectResult } from "../interfaces";

const verifyProjectExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const id: number = parseInt(req.params.id)

    const queryTemplate: string = format(
        `
            SELECT
                *
            FROM 
                projects AS p
            WHERE
                p."id" = %s;
        `,
        id
    )

    const queryResult: ProjectResult = await client.query(queryTemplate)

    if(!queryResult.rowCount){
        return res.status(404).json({
            message: "Project not found!"
        })
    }

    return next()
}

const verifyProjectDeveloperExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const id: number = req.body.developerId

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
    verifyProjectExists,
    verifyProjectDeveloperExists
}