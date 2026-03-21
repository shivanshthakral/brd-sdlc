import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Keep a reference to the server so it doesn't get garbage collected
let mongoServer: MongoMemoryServer;

const connectDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log(`In-Memory MongoDB Connected: ${mongoUri}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error(`An unknown error occurred`);
    }
    process.exit(1);
  }
};

export default connectDB;
