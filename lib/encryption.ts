import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

if (!ENCRYPTION_KEY && typeof window === 'undefined') {
  // Only warn server-side, don't throw so build doesn't fail
  console.warn('Warning: ENCRYPTION_KEY is not defined in environment variables')
}

/**
 * Encrypts a string value using AES-256
 */
export function encrypt(plaintext: string): string {
  if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY is not defined')
  return CryptoJS.AES.encrypt(plaintext, ENCRYPTION_KEY).toString()
}

/**
 * Decrypts an AES-256 encrypted string
 */
export function decrypt(ciphertext: string): string {
  if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY is not defined')
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * Encrypts sensitive fields in an object
 * Pass fields array to specify which keys to encrypt
 */
export function encryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj }
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field] as string) as T[keyof T]
    }
  }
  return result
}

/**
 * Decrypts sensitive fields in an object
 */
export function decryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj }
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = decrypt(result[field] as string) as T[keyof T]
      } catch {
        // Field may not be encrypted (backward compatibility)
      }
    }
  }
  return result
}

/**
 * Encrypt a task description for storage
 */
export function encryptTaskDescription(description: string): string {
  return encrypt(description)
}

/**
 * Decrypt a task description from storage
 */
export function decryptTaskDescription(encrypted: string): string {
  try {
    return decrypt(encrypted)
  } catch {
    return encrypted // Return as-is if decryption fails
  }
}