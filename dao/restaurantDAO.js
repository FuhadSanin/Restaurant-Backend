//Data Access Object
let restaurants
import { ObjectId } from "mongodb"

export default class RestaurantsDAO {
  //connenction to the database
  static async injectDB(conn) {
    if (restaurants) {
      return
    }
    try {
      restaurants = await conn
        .db(process.env.RESTREVIEWS_NS)
        .collection("restaurants")
    } catch {
      console.log(`Unable to connect the database RestaurantDAO : ${e}`)
    }
  }

  static async getRestaurants({
    filters = null,
    page = 0,
    restaurantsPerPage = 20,
  } = {}) {
    //1.Fetch the query of restaurant that is give after ? in the url
    let query
    if (filters) {
      if ("name" in filters) {
        query = { name: { $eq: filters["name"] } }
      } else if ("cuisine" in filters) {
        query = { cuisine: { $eq: filters["cuisine"] } }
      } else if ("zipcode" in filters) {
        query = { "address.zipcode": { $eq: filters["zipcode"] } }
      }
    }

    //2.Find the value by using the query from restaurant
    let cursor
    try {
      cursor = await restaurants.find(query)
    } catch (err) {
      console.log(`Unable to find the value : ${e}`)
      return { restaurants: [], totalNumRestaurants: 0 }
    }

    //Returning the value
    //3.display the cursor according to pagination
    const displayCursor = cursor
      //limit() sets the maximum number of documents to be retrieved.skip() determines how many documents to skip from the beginning of the result set
      .limit(restaurantsPerPage)
      .skip(restaurantsPerPage * page)
    //.skip(restaurantsPerPage * page): The skip() method is used to skip a certain number of documents from the beginning of the result set. It's used for pagination purposes. Here, restaurantsPerPage * page calculates the number of documents to skip based on the current page number (page) and the number of documents per page (restaurantsPerPage). For example, if restaurantsPerPage is 10 and page is 2, it would skip the first 20 documents (10 documents per page for the first two pages)

    try {
      const restaurantsList = await displayCursor.toArray()
      const totalNumRestaurants = await restaurants.countDocuments(query)
      return { restaurantsList, totalNumRestaurants }
    } catch (err) {
      return { restaurantsList: [], totalNumRestaurants: 0 }
    }
  }
  static async getRestaurantByID(id) {
    try {
      const pipeline = [
        //Checking the id
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        //Joining the review and restaurant collection by using lookup function and storing it in review field
        {
          $lookup: {
            from: "reviews",
            let: {
              id: "$_id",
            },
            //The $match stage filters the documents by the restaurant_id field of the reviews collection. The $$id variable is the restaurant_id field of the restaurants collection.
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$restaurant_id", "$$id"],
                  },
                },
              },
              {
                $sort: {
                  date: -1,
                },
              },
            ],
            as: "reviews",
          },
        },
        //Storing the review field in review field
        {
          $addFields: {
            reviews: "$reviews",
          },
        },
      ]
      //The aggregate() method is used to perform aggregation operations on the restaurants collection. The pipeline array contains the aggregation pipeline stages. The $match stage filters the documents by the _id field of the restaurants collection. The $lookup stage joins the reviews collection with the restaurants collection. The $addFields stage adds a reviews field to each document. The $addFields stage is necessary because the $lookup stage returns an array of documents, and we want to store the array in the reviews field of each restaurant document.
      return await restaurants.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getRestaurantByID: ${e}`)
      throw e
    }
  }
}
