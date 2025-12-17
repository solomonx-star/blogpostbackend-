import User from "../models/User.js";
import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload blog photo
export const uploadBlogPhoto = async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  const blogPhoto = req.file;

  try {
    if (!blogPhoto) {
      return res.status(400).json({ error: "File not found" });
    }

    // Upload to cloudinary - changed folder name to blog_images
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream({ folder: "blog_images" }, (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        })
        .end(blogPhoto.buffer);
    });

    // Update user with blog photo URL
    const user = await User.findByIdAndUpdate(
      userId,
      { blogPhoto: uploadResult.secure_url },
      { new: true }
    );

    // Fixed: Changed status code from 201 to 404 for user not found
    if (!user) {
      return res.status(404).json({ 
        status: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      message: "Blog photo uploaded successfully", 
      blogPhoto: uploadResult.secure_url,
      user 
    });

  } catch (error) {
    console.error("Error uploading blog photo:", error);
    res.status(500).json({ 
      message: "Error uploading blog photo", 
      error: error.message 
    });
  }
};

export const getBlogPhoto = async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.blogPhoto) {
      return res.status(404).json({ message: "Blog photo not found" });
    }

    // Fixed: For public URLs from Cloudinary, you don't need signed URLs
    // If the image is already uploaded with secure_url, just return it
    // Only use signed URLs if you uploaded as 'authenticated' type
    
    // Option 1: Return the secure URL directly (recommended for public images)
    res.status(200).json({ blogPhoto: user.blogPhoto });

    // Option 2: If you need signed URL for private images, use this instead:
    /*
    const publicId = user.blogPhoto.split('/').slice(-2).join('/').split('.')[0];
    
    const signedUrl = cloudinary.url(publicId, {
      type: "authenticated",
      sign_url: true,
      secure: true,
      transformation: [
        { fetch_format: "auto", quality: "auto" }
      ],
      expires_at: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes
    });

    res.status(200).json({ blogPhoto: signedUrl });
    */

  } catch (error) {
    console.error("Error retrieving blog photo:", error);
    res.status(500).json({ 
      message: "Error retrieving blog photo", 
      error: error.message 
    });
  }
};