const mongoose = require("mongoose");

// Cached across invocations so serverless platforms (Vercel) reuse the
// same connection instead of opening a new one on every request.
let cached = global._mongooseConn;
if (!cached) cached = global._mongooseConn = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongooseInstance) => {
        console.log(`MongoDB connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`MongoDB connection error: ${error.message}`);
    // In a long-running local/Render process it's fine to exit and let the
    // process manager restart it. On serverless (Vercel) exiting the whole
    // process is not appropriate, so we just re-throw instead.
    if (!process.env.VERCEL) process.exit(1);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
