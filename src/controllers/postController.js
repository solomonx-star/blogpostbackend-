import Post from "../models/Post.js";
import User from "../models/User.js";

export const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const postExist = await Post.findOne({ title, content });
    if (postExist)
      return res.status(400).json({ message: "Blog post already exists" });
    const data = await Post.create({ title, content });
    res
      .status(201)
      .json({
        status: "Success",
        message: "Blog posted successfully",
        statusCode: 201,
        data,
      });
  } catch (error) {
    next(error);
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const data = await Post.find();
    res.json({ message: "Success", statusCode: 200, data });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const data = await Post.findById(id);
    if (!data) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Success", statusCode: 200, data });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  const id = req.params.id;
  const { title, content } = req.body;
  try {
    const data = await Post.findById(id);

    const ifExist = await Post.findOne({ title, content });
    if (ifExist)
      return res.status(400).json({ message: "Blog post already exists" });

    if (!data) return res.status(404).json({ message: "Post not found" });

    // if (data.author.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'User not authorized to update this post' });
    // }

    data.title = title;
    data.content = content;

    const updatedPost = await data.save();
    res.json({message: "Success", statusCode: 200, updatedPost});
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  const id = req.params.id;
  try {
    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    // if (post.author.toString() !== req.user.id) {
    //   return res
    //     .status(403)
    //     .json({ message: "User not authorized to delete this post" });
    // }

    await post.deleteOne();
    res.json({ message: "Post removed" });
  } catch (error) {
    next(error);
  }
};
