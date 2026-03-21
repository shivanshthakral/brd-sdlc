import mongoose from "mongoose";

const requirementSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ["Client Discussion", "Internal Discussion", "Old Document", "External Link"] 
  },
  date: { type: Date, default: Date.now },
  textContent: { type: String },
  files: [{ type: String }], // Array of file paths
  links: [{ type: String }], // Array of URLs
}, { timestamps: true });

const Requirement = mongoose.model("Requirement", requirementSchema);

export default Requirement;
