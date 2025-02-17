const mongoose = require("mongoose");
const { Schema } = mongoose;


const IssueSchema = new Schema({
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],//enum mtlb list jisme ek category select krna h
      default: "open",
    },
    repository: {//bina repo ka issue nh ho skta h
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
  },
  {
    timestamps: true, // Added as a schema option
  }
);
  
  const Issue = mongoose.model("Issue", IssueSchema);
  module.exports = Issue;