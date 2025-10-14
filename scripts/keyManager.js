/**
 * Secure Private Key Manager
 * Encrypts and decrypts private keys using AES-256-GCM
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16;

/**
 * Generate a secure encryption key from a password
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt a private key
 */
function encryptPrivateKey(privateKey, password) {
  // Generate random salt and IV
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Derive encryption key from password
  const key = deriveKey(password, salt);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // Encrypt the private key
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get authentication tag
  const authTag = cipher.getAuthTag();
  
  // Combine salt, iv, authTag, and encrypted data
  const result = {
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encrypted: encrypted
  };
  
  return JSON.stringify(result);
}

/**
 * Decrypt a private key
 */
function decryptPrivateKey(encryptedData, password) {
  try {
    const data = JSON.parse(encryptedData);
    
    // Convert hex strings back to buffers
    const salt = Buffer.from(data.salt, 'hex');
    const iv = Buffer.from(data.iv, 'hex');
    const authTag = Buffer.from(data.authTag, 'hex');
    
    // Derive the same key from password
    const key = deriveKey(password, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt: Invalid password or corrupted data');
  }
}

/**
 * Save encrypted key to file
 */
function saveEncryptedKey(encryptedData, filename = '.env.encrypted') {
  const filePath = path.join(__dirname, '..', filename);
  fs.writeFileSync(filePath, encryptedData, 'utf8');
  console.log(`✅ Encrypted key saved to: ${filename}`);
}

/**
 * Load encrypted key from file
 */
function loadEncryptedKey(filename = '.env.encrypted') {
  const filePath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Encrypted key file not found: ${filename}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Interactive CLI for encrypting a private key
 */
async function encryptKeyInteractive() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => readline.question(query, resolve));

  try {
    console.log('\n🔐 Private Key Encryption Tool\n');
    
    const privateKey = await question('Enter your private key (will be hidden): ');
    const password = await question('Enter encryption password: ');
    const confirmPassword = await question('Confirm password: ');
    
    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match!');
      readline.close();
      return;
    }
    
    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters!');
      readline.close();
      return;
    }
    
    // Encrypt the key
    const encrypted = encryptPrivateKey(privateKey, password);
    
    // Save to file
    saveEncryptedKey(encrypted);
    
    console.log('\n✅ Private key encrypted successfully!');
    console.log('📝 The encrypted key is stored in: .env.encrypted');
    console.log('⚠️  Keep your password safe - you\'ll need it to decrypt the key');
    console.log('\n🔒 You can now remove the plain private key from .env file');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    readline.close();
  }
}

/**
 * Interactive CLI for decrypting a private key
 */
async function decryptKeyInteractive() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => readline.question(query, resolve));

  try {
    console.log('\n🔓 Private Key Decryption Tool\n');
    
    const encryptedData = loadEncryptedKey();
    const password = await question('Enter decryption password: ');
    
    const decrypted = decryptPrivateKey(encryptedData, password);
    
    console.log('\n✅ Private key decrypted successfully!');
    console.log('🔑 Your private key:', decrypted);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    readline.close();
  }
}

// Export functions
module.exports = {
  encryptPrivateKey,
  decryptPrivateKey,
  saveEncryptedKey,
  loadEncryptedKey,
  encryptKeyInteractive,
  decryptKeyInteractive
};

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'encrypt') {
    encryptKeyInteractive();
  } else if (command === 'decrypt') {
    decryptKeyInteractive();
  } else {
    console.log(`
🔐 Private Key Manager

Usage:
  node scripts/keyManager.js encrypt   - Encrypt your private key
  node scripts/keyManager.js decrypt   - Decrypt your private key

Examples:
  node scripts/keyManager.js encrypt
  node scripts/keyManager.js decrypt
    `);
  }
}
