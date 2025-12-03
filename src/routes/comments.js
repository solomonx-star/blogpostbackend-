import { Router } from 'express';
import { body } from 'express-validator';
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.post(
  '/:postId',
  [body('content').notEmpty()],
  auth,
  createComment
);

router.get('/:postId', getCommentsByPost);

router.put(
  '/:commentId',
  [body('content').notEmpty()],
  auth,
  updateComment
);

router.delete('/:commentId', auth, deleteComment);

export default router;
