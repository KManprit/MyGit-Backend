const mongoose = require("mongoose");
const { Schema } = mongoose;

const RepositorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    content: [
      {
        type: String,
      },
    ],
    visibility: {
      type: Boolean, // true means public, false means private
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // Owned by a user
      required: true,
    },
    issues: [
      {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
  },
  {
    timestamps: true, // Add this as an option here
  }
);

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;
