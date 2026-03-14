// import mongoose from 'mongoose'
// import dotenv from 'dotenv';
// dotenv.config(); 

// const MONGODB_URI = process.env.MONGODB_URI!

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable in .env.local')
// }

// interface GlobalMongoose {
//   conn: typeof mongoose | null
//   promise: Promise<typeof mongoose> | null
// }

// declare global {
//   var mongoose: GlobalMongoose | undefined
// }

// const cached: GlobalMongoose = global.mongoose ?? { conn: null, promise: null }

// if (!global.mongoose) {
//   global.mongoose = cached
// }

// async function connectDB(): Promise<typeof mongoose> {
//   if (cached.conn) {
//     return cached.conn
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     }

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       return mongoose
//     })
//   }

//   try {
//     cached.conn = await cached.promise
//   } catch (e) {
//     cached.promise = null
//     throw e
//   }

//   return cached.conn
// }

// export default connectDB






import mongoose from 'mongoose'
const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local')
}

interface GlobalMongoose {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: GlobalMongoose | undefined
}

const cached: GlobalMongoose = global.mongoose ?? { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

async function connectDB(): Promise<typeof mongoose> {
  console.log('URI protocol:', MONGODB_URI?.split('://')[0])
  console.log('URI loaded:', !!MONGODB_URI)

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      dbName: 'taskflow', // ← replace with your actual db name
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('DB connection error:', (e as Error).message)
    throw e
  }

  return cached.conn
}

export default connectDB