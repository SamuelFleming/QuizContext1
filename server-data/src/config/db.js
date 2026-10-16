import mongoose from "mongoose";

export async function connectDatabase(uri) {
  if (!uri || mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
}

export async function pingDatabase(uri) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDatabase(uri);
    }
    if (mongoose.connection.readyState !== 1) {
      return false;
    }
    await mongoose.connection.db.admin().ping();
    return true;
  } catch {
    return false;
  }
}
