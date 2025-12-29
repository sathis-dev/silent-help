/**
 * Field-Level Encryption Utilities
 * 
 * Implements AES-256-GCM encryption for GDPR-compliant data protection.
 * Used for encrypting sensitive journal content before database storage.
 * 
 * UK Data Protection Requirements:
 * - Field-level encryption for PII
 * - Secure key management (keys stored in environment, not in code)
 * - Audit-ready encryption metadata (IV, auth tag stored separately)
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits for GCM
const TAG_LENGTH = 16; // 128 bits authentication tag
const SALT_LENGTH = 32;

interface EncryptedData {
  encrypted: string;  // Base64 encoded ciphertext
  iv: string;         // Base64 encoded initialization vector
  tag: string;        // Base64 encoded authentication tag
}

interface DecryptedData {
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Derives an encryption key from a master key and user-specific salt.
 * Uses scrypt for key derivation (recommended for password-based encryption).
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return scryptSync(masterKey, salt, KEY_LENGTH);
}

/**
 * Gets the master encryption key from environment variables.
 * In production, this should come from a secure key management service (AWS KMS, etc.)
 */
function getMasterKey(): string {
  const key = process.env.ENCRYPTION_MASTER_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_MASTER_KEY environment variable is not set');
  }
  if (key.length < 32) {
    throw new Error('ENCRYPTION_MASTER_KEY must be at least 32 characters');
  }
  return key;
}

/**
 * Encrypts sensitive content using AES-256-GCM.
 * 
 * @param plaintext - The content to encrypt
 * @param userId - User ID for key derivation (user-specific encryption)
 * @returns Encrypted data with IV and authentication tag
 */
export function encryptContent(plaintext: string, userId: string): EncryptedData {
  try {
    const masterKey = getMasterKey();
    
    // Create user-specific salt from userId (deterministic for same user)
    const userSalt = Buffer.from(userId.replace(/-/g, ''), 'hex').subarray(0, SALT_LENGTH);
    
    // Derive user-specific key
    const key = deriveKey(masterKey, userSalt);
    
    // Generate random IV for each encryption
    const iv = randomBytes(IV_LENGTH);
    
    // Create cipher and encrypt
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt content');
  }
}

/**
 * Decrypts content that was encrypted with encryptContent.
 * 
 * @param encryptedData - The encrypted data object
 * @param userId - User ID for key derivation
 * @returns Decrypted content or error information
 */
export function decryptContent(encryptedData: EncryptedData, userId: string): DecryptedData {
  try {
    const masterKey = getMasterKey();
    
    // Recreate user-specific salt
    const userSalt = Buffer.from(userId.replace(/-/g, ''), 'hex').subarray(0, SALT_LENGTH);
    
    // Derive the same key
    const key = deriveKey(masterKey, userSalt);
    
    // Decode IV and tag from base64
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const tag = Buffer.from(encryptedData.tag, 'base64');
    
    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt
    let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return {
      content: decrypted,
      success: true,
    };
  } catch (error) {
    console.error('Decryption error:', error);
    return {
      content: '',
      success: false,
      error: 'Failed to decrypt content. Data may be corrupted or key mismatch.',
    };
  }
}

/**
 * Generates a new encryption key for a user.
 * Used when creating a new user account.
 */
export function generateUserKeyId(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Validates that an encryption key ID is properly formatted.
 */
export function isValidKeyId(keyId: string): boolean {
  return /^[a-f0-9]{64}$/.test(keyId);
}

/**
 * Securely compares two strings in constant time.
 * Prevents timing attacks on authentication tags.
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
