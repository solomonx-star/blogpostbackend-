
import { Schema, model } from 'mongoose';

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blogPhoto: { type: String, default: "" },
  },
  { timestamps: true }
);

export default model('Post', postSchema);
