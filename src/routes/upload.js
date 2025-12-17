import {Router} from "express";
import { getBlogPhoto, uploadBlogPhoto } from "../controllers/uploadController.js";
import authMiddleware from "../middlewares/auth.js";
import multer from "multer";

const router = Router()

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post(
  "/blog-photo",
  authMiddleware,
  upload.single("blogPhoto"),
  uploadBlogPhoto
);

router.get("/blog-photo", authMiddleware, getBlogPhoto);



export default router;
