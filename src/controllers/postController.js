import Post from "../models/Post.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import cloudinary from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const blogPhoto = req.file; // From multer middleware
    
    if (!title || !content || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const author = req.user?.id || req.user?._id;
    const authorName = req.user?.username; // Get from authenticated user

    if (!author) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if post already exists
    const postExist = await Post.findOne({ title, author });
    if (postExist) {
      return res.status(400).json({ message: "You already have a post with this title" });
    }
    
    let blogPhotoUrl = null;

    // Upload photo to Cloudinary if provided
    if (blogPhoto) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.v2.uploader
            .upload_stream(
              { 
                folder: "blog_posts",
                transformation: [
                  { width: 1200, height: 630, crop: "limit" }, // Optimize size
                  { quality: "auto", fetch_format: "auto" }
                ]
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            )
            .end(blogPhoto.buffer);
        });

        blogPhotoUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Error uploading photo:", uploadError);
        return res.status(500).json({ 
          message: "Error uploading photo", 
          error: uploadError.message 
        });
      }
    }
    
    // Create post with or without photo
    const data = await Post.create({ 
      title, 
      content, 
      category, 
      author,
      authorName,
      blogPhoto: blogPhotoUrl 
    });
    
    res.status(201).json({
      status: "Success",
      message: "Blog posted successfully",
      statusCode: 201,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createPos = async (req, res, next) => {
  try {
    const { title, content, category, blogPhoto } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const author = req.user?.id || req.user?._id;

    if (!author) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const postExist = await Post.findOne({ title, content, blogPhoto });
    if (postExist)
      return res.status(400).json({ message: "Blog post already exists" });
    
    const data = await Post.create({ title, content, category, author, blogPhoto });
    
    res.status(201).json({
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
    logger.info(`Retrieved ${data.length} posts`);

    // Explicitly set status code
    res.status(200).json({
      statusCode: 200,
      message: "Success",
      count: data.length,
      data,
    });
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
    res.json({ message: "Success", statusCode: 200, updatedPost });
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

export const getPostsByAuthor = async (req, res, next) => {
  const authorId = req.params.authorId;
  try {
    const data = await Post.find({ author: authorId });
    if (!data) return res.status(404).json({ message: "No posts found for this author" });
    res.json({ message: "Success", statusCode: 200, data });
  } catch (error) {
    next(error);
  }
};


export const updatePostPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blogPhoto = req.file;
    const userId = req.user?.id || req.user?._id;

    if (!blogPhoto) {
      return res.status(400).json({ message: "No photo provided" });
    }

    // Find post and verify ownership
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only update your own posts" });
    }

    // Delete old photo from Cloudinary if exists
    if (post.blogPhoto) {
      try {
        const publicId = post.blogPhoto.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.v2.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error("Error deleting old photo:", deleteError);
      }
    }

    // Upload new photo
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          { 
            folder: "blog_posts",
            transformation: [
              { width: 1200, height: 630, crop: "limit" },
              { quality: "auto", fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(blogPhoto.buffer);
    });

    // Update post with new photo
    post.blogPhoto = uploadResult.secure_url;
    await post.save();

    res.status(200).json({
      status: "Success",
      message: "Photo updated successfully",
      data: post
    });

  } catch (error) {
    next(error);
  }
};

// Delete post photo
export const deletePostPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete photos from your own posts" });
    }

    if (!post.blogPhoto) {
      return res.status(404).json({ message: "Post has no photo" });
    }

    // Delete from Cloudinary
    try {
      const publicId = post.blogPhoto.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.v2.uploader.destroy(publicId);
    } catch (deleteError) {
      console.error("Error deleting photo from Cloudinary:", deleteError);
    }

    // Remove photo from post
    post.blogPhoto = null;
    await post.save();

    res.status(200).json({
      status: "Success",
      message: "Photo deleted successfully",
      data: post
    });

  } catch (error) {
    next(error);
  }
};