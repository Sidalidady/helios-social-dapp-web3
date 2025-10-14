/**
 * Load and decrypt private key for deployment
 */

const { decryptPrivateKey, loadEncryptedKey } = require('./keyManager');
const readline = require('readline');

async function loadSecurePrivateKey() {
  try {
    // Try to load encrypted key
    const encryptedData = loadEncryptedKey();
    
    // Prompt for password
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve, reject) => {
      rl.question('🔐 Enter password to decrypt private key: ', (password) => {
        rl.close();
        
        try {
          const privateKey = decryptPrivateKey(encryptedData, password);
          console.log('✅ Private key decrypted successfully');
          resolve(privateKey);
        } catch (error) {
          reject(new Error('Failed to decrypt private key: ' + error.message));
        }
      });
    });
  } catch (error) {
    // Fallback to .env file if encrypted key doesn't exist
    console.log('⚠️  No encrypted key found, using .env file');
    return process.env.PRIVATE_KEY;
  }
}

module.exports = { loadSecurePrivateKey };
