import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import logger from '../utils/logger.js';

export const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    const author = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      content,
      author,
      post: postId,
    });

    res.status(201).json({
      status: 'Success',
      message: 'Comment added successfully',
      statusCode: 201,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

export const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId }).populate('author', 'name');
    logger.info(`Retrieved ${comments.length} comments for post ${postId}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Success',
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: 'User not authorized to update this comment' });
    }

    comment.content = content;
    const updatedComment = await comment.save();

    res.json({ message: 'Success', statusCode: 200, data: updatedComment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: 'User not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    next(error);
  }
};
