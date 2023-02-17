import express, { Application } from "express"
import { startDatabase } from "./database"

import {  
    createDeveloper,
    listOneDeveloper,
    listDeveloperProjects,
    listAllDevelopers,
    updateDeveloper,
    deleteDeveloper,
    createDeveloperInfos,
    updateDeveloperInfos,
    createProject,
    listOneProject,
    listAllProjects,
    updateProject,
    deleteProject,
    createTechnology,
    deleteTechnology 
} from "./logics"

import {
    verifyEmailAvailability, 
    verifyDeveloperExists, 
    verifyProjectExists,
    verifyProjectDeveloperExists
} from "./middlewares"

const app: Application = express()
app.use(express.json())

//Rotas - Developers
app.post("/developers", verifyEmailAvailability, createDeveloper)
app.get("/developers/:id", verifyDeveloperExists, listOneDeveloper)
app.get("/developers/:id/projects", verifyDeveloperExists, listDeveloperProjects)
app.get("/developers", listAllDevelopers)
app.patch("/developers/:id", verifyDeveloperExists, verifyEmailAvailability, updateDeveloper)
app.delete("/developers/:id", verifyDeveloperExists, deleteDeveloper)
app.post("/developers/:id/infos", verifyDeveloperExists, createDeveloperInfos)
app.patch("/developers/:id/infos", updateDeveloperInfos)


// Rotas - projects
app.post("/projects", verifyProjectDeveloperExists, createProject)
app.get("/projects", listAllProjects )
app.get("/projects/:id", verifyProjectExists, listOneProject)
app.patch("/projects/:id", verifyProjectExists, verifyProjectDeveloperExists, updateProject )
app.delete("/projects/:id", verifyProjectExists, deleteProject )
app.post("/projects/:id/technologies", verifyProjectExists, createTechnology )
app.delete("/projects/:id/technologies/:name", verifyProjectExists, deleteTechnology )

app.listen(3000, async () => {
    console.log("Server is running in port 3000!")
    await startDatabase()
})



