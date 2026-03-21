import mongoose from "mongoose";

const brdSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  version: { type: Number, required: true },
  content: { type: String, required: true }, // The generated BRD HTML/Markdown
  generatedAt: { type: Date, default: Date.now },
});

const BRD = mongoose.model("BRD", brdSchema);

export default BRD;
