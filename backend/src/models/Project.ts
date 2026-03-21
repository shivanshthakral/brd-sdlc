import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  projectName: { type: String, required: true },
  client: { type: String, required: true },
  geography: { type: String, required: true },
  owner: { type: String, required: true },
  startDate: { type: Date, required: true },
  description: { type: String },
  status: { type: String, default: "Requirement Gathering" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);

export default Project;
