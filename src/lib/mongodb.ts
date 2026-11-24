import mongoose from 'mongoose';
import dns from 'node:dns';

/**
 * Standard Next.js + Mongoose connection: one cached connection per server
 * instance, reused across requests and hot reloads.
 */

// Some ISP routers refuse the SRV lookup that mongodb+srv:// needs ("querySrv ECONNREFUSED").
// Resolve through public DNS: always in development, and in production only if MONGODB_DNS is set
// (comma-separated servers, e.g. "8.8.8.8,1.1.1.1"; set MONGODB_DNS=system to keep the OS resolver).
const dnsSetting = process.env.MONGODB_DNS?.trim();
const dnsServers =
  dnsSetting === 'system'
    ? null
    : dnsSetting
      ? dnsSetting.split(',').map((s) => s.trim()).filter(Boolean)
      : process.env.NODE_ENV !== 'production'
        ? ['8.8.8.8', '1.1.1.1']
        : null;
if (dnsServers?.length) {
  try {
    dns.setServers(dnsServers);
    dns.promises.setServers(dnsServers); // the MongoDB driver resolves SRV records with the promise API
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
