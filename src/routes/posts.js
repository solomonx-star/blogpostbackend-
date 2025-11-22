import { Router } from "express";
import { body } from "express-validator";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import auth from "../middlewares/auth.js";

const router = Router();

router.post(
  "/blog-post",
  [
    body("title").notEmpty(),
    body("content").notEmpty(),
    body("category").notEmpty(),
    body("authorName").notEmpty(),
  ],
  createPost,
  auth
);

router.get("/all-posts", getAllPosts);

router.get("/:id", getPostById);

router.put(
  "/update/:id",
  [
    body("title").notEmpty(),
    body("content").notEmpty(),
    body("category").notEmpty(),
    body("authorName").notEmpty(),
  ],
  updatePost,
  auth
);

router.delete("/delete/:id", deletePost, auth);

export default router;
