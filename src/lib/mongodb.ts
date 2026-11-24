import mongoose from 'mongoose';
import dns from 'dns';

/**
 * Standard Next.js + Mongoose connection: one cached connection per server
 * instance, reused across requests and hot reloads.
 */

// Some local ISP routers fail Atlas SRV lookups; use public DNS in development only.
if (process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // not allowed in some environments; the system resolver is used instead
  }
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = (global.mongooseCache ??= { conn: null, promise: null });

export default async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  cached.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10,
  });

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // let the next request try again
    throw error;
  }
  return cached.conn;
}
