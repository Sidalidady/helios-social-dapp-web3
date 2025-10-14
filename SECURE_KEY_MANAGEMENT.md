# 🔐 Secure Private Key Management

This guide explains how to securely encrypt and manage your private key for contract deployment.

## 🎯 Overview

Your private key is now protected using **AES-256-GCM encryption** with password-based key derivation (PBKDF2).

### Security Features:
- ✅ **AES-256-GCM encryption** - Military-grade encryption
- ✅ **PBKDF2 key derivation** - 100,000 iterations for password strengthening
- ✅ **Random salt and IV** - Unique for each encryption
- ✅ **Authentication tag** - Prevents tampering
- ✅ **Password protected** - Only you can decrypt

## 📋 Quick Start

### Step 1: Encrypt Your Private Key

Run the encryption tool:
```bash
node scripts/keyManager.js encrypt
```

You'll be prompted to:
1. Enter your private key
2. Create a strong password (min 8 characters)
3. Confirm the password

**Example:**
```
🔐 Private Key Encryption Tool

Enter your private key (will be hidden): 0x1234...
Enter encryption password: ********
Confirm password: ********

✅ Private key encrypted successfully!
📝 The encrypted key is stored in: .env.encrypted
⚠️  Keep your password safe - you'll need it to decrypt the key
```

### Step 2: Remove Plain Private Key

After encryption, you can safely remove the plain private key from your `.env` file:

**Before:**
```env
PRIVATE_KEY=0x1234567890abcdef...
```

**After:**
```env
# PRIVATE_KEY removed - using encrypted key
```

### Step 3: Deploy with Encrypted Key

When deploying, you'll be prompted for your password:
```bash
npx hardhat run scripts/deploy.js --network helios-testnet
```

## 🔓 Decrypt Your Private Key

If you need to view your private key:
```bash
node scripts/keyManager.js decrypt
```

You'll be prompted for your password, and the decrypted key will be displayed.

## 📁 File Structure

```
.
├── .env                    # Plain environment variables (no private key)
├── .env.encrypted          # Encrypted private key (gitignored)
├── scripts/
│   ├── keyManager.js       # Encryption/decryption tool
│   └── loadSecureKey.js    # Load encrypted key for deployment
└── hardhat.config.js       # Updated to support encrypted keys
```

## 🛡️ Security Best Practices

### ✅ DO:
- Use a **strong password** (12+ characters, mix of letters, numbers, symbols)
- **Store your password securely** (password manager recommended)
- **Backup** your `.env.encrypted` file in a secure location
- Keep `.env.encrypted` in `.gitignore`

### ❌ DON'T:
- Don't commit `.env.encrypted` to public repositories
- Don't share your encryption password
- Don't use weak passwords like "password123"
- Don't store the password in plain text files

## 🔄 Migration Guide

### From Plain to Encrypted:

1. **Backup your current `.env` file**
   ```bash
   cp .env .env.backup
   ```

2. **Encrypt your private key**
   ```bash
   node scripts/keyManager.js encrypt
   ```

3. **Test decryption**
   ```bash
   node scripts/keyManager.js decrypt
   ```

4. **Remove plain key from `.env`**
   - Comment out or delete the `PRIVATE_KEY=` line

5. **Test deployment**
   ```bash
   npx hardhat run scripts/deploy.js --network helios-testnet
   ```

## 🔧 Technical Details

### Encryption Algorithm
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with SHA-256
- **Iterations**: 100,000
- **Salt**: 32 bytes (random)
- **IV**: 16 bytes (random)
- **Auth Tag**: 16 bytes

### Encrypted Data Format
```json
{
  "salt": "hex_encoded_salt",
  "iv": "hex_encoded_iv",
  "authTag": "hex_encoded_auth_tag",
  "encrypted": "hex_encoded_encrypted_data"
}
```

## 🆘 Troubleshooting

### "Failed to decrypt: Invalid password or corrupted data"
- Double-check your password
- Ensure `.env.encrypted` file hasn't been modified
- Restore from backup if corrupted

### "Encrypted key file not found"
- Run `node scripts/keyManager.js encrypt` first
- Check if `.env.encrypted` exists in the root directory

### "No PRIVATE_KEY in .env"
- This is normal if using encrypted keys
- The system will prompt for password during deployment

## 📞 Support

If you encounter issues:
1. Check this documentation
2. Verify your password is correct
3. Ensure `.env.encrypted` file exists
4. Try re-encrypting your key

## 🔒 Password Recovery

**IMPORTANT**: If you forget your password, there is **NO WAY** to recover your encrypted private key. 

**Backup Strategy:**
1. Keep your original private key in a secure location (hardware wallet, password manager)
2. Store your encryption password separately
3. Consider using a password manager with secure notes

---

**Remember**: The security of your private key is only as strong as your password! 🔐
