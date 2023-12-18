import express from "express"
import cors from "cors"
import restaurantRoutes from "./api/restaurant-routes.js"
import dotenv from "dotenv"
import MongoDB from "mongodb"
import RestaurantsDAO from "./dao/restaurantDAO.js"
import ReviewDAO from "./dao/reviewDAO.js"

dotenv.config()
const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/", restaurantRoutes)
app.use("*", (req, res) => {
  res.status(404).send("Error")
})

const MongoClient = MongoDB.MongoClient

MongoClient.connect(process.env.RESTREVIEWS_DB_URI)
  .then(async client => {
    await RestaurantsDAO.injectDB(client)
    await ReviewDAO.injectDB(client)
    app.listen(port, () => {
      console.log(
        `Listening to the : http://localhost:${port}/api/v1/restaurants`
      )
    })
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err)
    process.exit(1)
  })
