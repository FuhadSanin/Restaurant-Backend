import { ObjectId } from "mongodb"

let reviews

export default class ReviewDAO {
  static async injectDB(conn) {
    if (reviews) {
      return
    }
    try {
      reviews = await conn.db(process.env.RESTREVIEWS_NS).collection("reviews")
    } catch (err) {
      console.log(`Unable to connect the database reviewDAO : ${err}`)
    }
  }

  static async addReview(restaurantId, user, review, date) {
    try {
      const reviewDoc = {
        name: user.name,
        user_id: user._id,
        date: date,
        text: review,
        restaurant_id: new ObjectId(restaurantId),
      }
      return await reviews.insertOne(reviewDoc)
    } catch (e) {
      console.error(`Unable to post review: ${e}`)
      return { error: e }
    }
  }

  static async setReview(reviewID, text, user_id, date) {
    try {
      const updateReview = await reviews.updateOne(
        {
          user_id: user_id,
          _id: new ObjectId(reviewID),
        }, //This object is the filter or query criteria for matching the document to update. It consists of two conditions joined by logical AND:
        { $set: { text: text, date: date } }
      )
      return updateReview
    } catch (error) {
      console.log(`Unable to setReview : ${error}`)
    }
  }
  static async delReview(reviewId, user_id) {
    try {
      const deleteReview = await reviews.deleteOne({
        _id: new ObjectId(reviewId),
        user_id: user_id,
      })
      console.log(deleteReview)
      return deleteReview
    } catch (error) {
      console.log(`Unable to delReview : ${error}`)
    }
  }
}
