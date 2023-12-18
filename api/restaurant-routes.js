import express from "express"
import RestaurantsController from "./restaurant-controller.js"
import ReviewsController from "./reviews-controller.js"

const router = express.Router()

router.route("/").get(RestaurantsController.apiGetRestaurants)
router.route("/id/:id").get(RestaurantsController.apiGetRestaurantById)

router
  .route("/review")
  .post(ReviewsController.postReview)
  .put(ReviewsController.updateReview)
  .delete(ReviewsController.deleteReview)

export default router
