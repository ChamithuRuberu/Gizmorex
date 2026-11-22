import mongoose from 'mongoose';
import dns from 'dns';

// Fix querySrv ECONNREFUSED on local ISP / router DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gizmorex';

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: GlobalMongoose;
}

let cached = global.mongooseCache;
if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

let lastFailureTime = 0;
const FAILURE_COOLDOWN_MS = 60_000; // 60s fast-fail cooldown if MongoDB Atlas is unreachable

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Circuit Breaker: If recently failed (e.g. IP whitelist block), fail in 0ms so fallback data is served instantly
  const now = Date.now();
  if (now - lastFailureTime < FAILURE_COOLDOWN_MS) {
    throw new Error('Database offline or IP not whitelisted (fast-fail circuit open)');
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500, // Reduced from 4000ms to 1500ms
      connectTimeoutMS: 1500,
      socketTimeoutMS: 5000,
    };
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        lastFailureTime = 0;
        return m;
      })
      .catch((err) => {
        lastFailureTime = Date.now();
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    lastFailureTime = 0;
  } catch (e) {
    lastFailureTime = Date.now();
    cached.conn = null;
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
