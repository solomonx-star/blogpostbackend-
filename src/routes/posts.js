import { Router } from "express";
import { body } from "express-validator";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByAuthor,
} from "../controllers/postController.js";
import auth from "../middlewares/auth.js";
import { uploadSingle, handleMulterError } from "../middlewares/upload.js";

const router = Router();

router.post(
  "/blog-post",
  [
    body("title").notEmpty(),
    body("content").notEmpty(),
    body("category").notEmpty(),
    body("blogPhoto").notEmpty(),
    body("authorName").notEmpty(),
  ],
  auth,
  uploadSingle,
  handleMulterError,
  createPost
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
  auth,
  updatePost
);

router.delete("/delete/:id", auth, deletePost);

router.get("/author/:authorId", auth, getPostsByAuthor);

export default router;
