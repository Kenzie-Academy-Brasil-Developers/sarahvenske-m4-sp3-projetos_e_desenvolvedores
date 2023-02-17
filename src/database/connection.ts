import client from "./config"

const startDatabase = async (): Promise<void> => {
    await client.connect()
    console.log("Database connected!")
}

export default startDatabase