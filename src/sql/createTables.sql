-- Criação das Tabelas  Informações

CREATE type os_type AS ENUM ('Windows', 'Linux', 'MacOS');

CREATE TABLE IF NOT EXISTS developer_infos (
    "id" SERIAL PRIMARY KEY,
    "developerSince" DATE NOT NULL,
    "preferredOS" os_type NOT NULL
);

CREATE TABLE IF NOT EXISTS developers (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "developerInfoId" INTEGER UNIQUE,
    FOREIGN KEY ("developerInfoId") REFERENCES developer_infos("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedTime" VARCHAR(20) NOT NULL,
    "repository" VARCHAR(120) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "developerId" INTEGER NOT NULL,
    FOREIGN KEY ("developerId") REFERENCES developers("id")
);

CREATE TABLE IF NOT EXISTS technologies (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(30) NOT NULL    
);

CREATE TABLE IF NOT EXISTS projects_technologies (
    "id" SERIAL PRIMARY KEY,
    "addedIn" DATE NOT NULL,
    "technologyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    FOREIGN KEY ("technologyId") REFERENCES technologies("id"),
    FOREIGN KEY ("projectId") REFERENCES projects("id") 
);

INSERT INTO technologies ("name")
VALUES ('JavaScript'), ('Phyton'), ('React'), ('Express.js'), ('HTML'), ('CSS'), ('Django'), ('PostgreSQL'), ('MongoDB'); 
