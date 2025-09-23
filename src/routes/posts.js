
import { Router } from 'express';
import { body } from 'express-validator';
import { createPost, getAllPosts, getPostById, updatePost, deletePost } from '../controllers/postController.js';
import auth from '../middlewares/auth.js';

const router = Router();


router.post('/blog-post', [
  body('title').notEmpty(),
  body('content').notEmpty(),
], createPost);


router.get('/all-posts', getAllPosts);

router.get('/:id', getPostById);

router.put('/update/:id', [
  body('title').notEmpty(),
  body('content').notEmpty(),
], updatePost);

router.delete('/delete/:id', deletePost);

export default router;
