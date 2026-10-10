import mongoose from 'mongoose';

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI;

  if (!connUri) {
    console.error('[Database Error] MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout for Atlas DNS/handshake
  };

  const connectWithRetry = async () => {
    try {
      const conn = await mongoose.connect(connUri, options);
      console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    } catch (error) {
      console.error(`\n[Database Error] Failed to connect to MongoDB: ${error.message}`);
      console.log(`[Database] Retrying connection in 5 seconds...\n`);
      setTimeout(connectWithRetry, 5000);
    }
  };

  await connectWithRetry();
};

export default connectDB;
