import ReviewDAO from "../dao/reviewDAO.js"

export default class ReviewsController {
  static async postReview(req, res, next) {
    try {
      //1.Fetch the data
      const restaurantId = req.body.restaurant_id
      const review = req.body.text
      const userInfo = {
        name: req.body.name,
        _id: req.body.user_id,
      }
      const date = new Date()
      console.log(req.body)

      const ReviewResponse = await ReviewDAO.addReview(
        restaurantId,
        userInfo,
        review,
        date
      )

      res.status(200).json({ status: "Add success" })
    } catch (err) {
      console.log("ADD error")
    }
  }
  static async updateReview(req, res, next) {
    try {
      const reviewID = req.body.reviewID
      const text = req.body.text
      const date = new Date()

      const ReviewResponse = ReviewDAO.setReview(
        reviewID,
        text,
        req.body.user_id,
        date
      )
      var { error } = ReviewResponse
      if (error) {
        res.status(400).json({ error })
      }

      if (ReviewResponse.modifiedCount === 0) {
        throw new Error(
          "unable to update review - user may not be original poster"
        )
      }

      res.status(200).json({ status: "Update success" })
    } catch (err) {
      console.log("Update error")
    }
  }
  static async deleteReview(req, res, next) {
    try {
      const reviewId = req.query.id
      const user_id = req.body.user_id
      console.log(reviewId)
      const ReviewResponse = await ReviewDAO.delReview(reviewId, user_id)
      res.json({ success: "Delete Success" })
    } catch (err) {
      console.log("Update error")
    }
  }
}
