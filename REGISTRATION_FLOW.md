# Registration Flow Documentation

## Overview

When users connect their wallet for the first time, they are required to create a unique username that will be permanently linked to their wallet address. This ensures every user has a recognizable identity on the platform.

## How It Works

### 1. Wallet Connection
- User clicks "Connect Wallet" and selects their preferred wallet
- Wallet connection is established with Helios Testnet

### 2. Profile Check
- System automatically checks if the connected wallet has a registered username
- If no username exists, the registration modal appears immediately

### 3. Registration Modal
The registration form requires:

#### **Full Name** (Required)
- Display name for the user
- 1-50 characters
- Can be changed later in profile settings

#### **Username** (Required)
- Unique identifier starting with @
- 3-20 characters
- Only letters, numbers, and underscores allowed
- Cannot be changed after registration
- Permanently linked to wallet address

### 4. Username Validation
- Real-time validation as user types
- Format check: alphanumeric + underscore only
- Length check: 3-20 characters
- Visual feedback:
  - ✅ Green checkmark = Valid format
  - ❌ Red X = Invalid format
  - ⏳ Loading spinner = Checking availability

### 5. Account Creation
Once submitted:
1. Profile data is uploaded to IPFS
2. Username and IPFS hash are stored on blockchain
3. Transaction is confirmed
4. Success message displays with new username
5. User can start using the platform

## User Experience Flow

```
Connect Wallet
    ↓
Check Profile
    ↓
Has Username? ──Yes──→ Continue to App
    ↓ No
Registration Modal
    ↓
Fill Name & Username
    ↓
Validate Username
    ↓
Submit & Confirm Transaction
    ↓
Success! Welcome to Helios Social
    ↓
Continue to App
```

## Features

### Permanent Username
- Username is permanently linked to wallet address
- Cannot be changed once set
- Ensures consistent identity across the platform

### Profile Display
- Username appears in:
  - Header (when connected)
  - All user posts
  - Profile modal
  - User interactions

### Skip Option
- Users can skip registration temporarily
- Will be prompted again on next connection
- Limited functionality without username:
  - Can view posts
  - Cannot create posts (requires username)

## Technical Details

### Smart Contract Integration
```solidity
function updateProfile(string memory _displayName, string memory _profileIpfsHash)
```
- Stores username (displayName) on-chain
- Links IPFS hash for additional profile data
- Emits `ProfileUpdated` event

### Data Storage
**On-Chain (Blockchain):**
- Username
- IPFS hash reference
- Wallet address linkage

**Off-Chain (IPFS):**
- Full name
- Bio
- Profile image
- Registration timestamp

### Profile Structure
```json
{
  "username": "johndoe",
  "name": "John Doe",
  "bio": "",
  "address": "0x1234...",
  "timestamp": 1234567890,
  "registeredAt": "2024-01-01T00:00:00.000Z"
}
```

## User Guidelines

### Choosing a Username

**Good Usernames:**
- `crypto_enthusiast`
- `web3_builder`
- `helios_user`
- `alice_2024`

**Invalid Usernames:**
- `ab` (too short, minimum 3 characters)
- `this_is_a_very_long_username_that_exceeds_limit` (too long, max 20)
- `user@name` (special characters not allowed)
- `user name` (spaces not allowed)

### Best Practices
1. **Choose carefully** - Username cannot be changed
2. **Keep it professional** - It represents your identity
3. **Make it memorable** - Easy for others to remember
4. **Avoid impersonation** - Don't pretend to be someone else
5. **Check spelling** - Double-check before submitting

## For Developers

### Components

**Registration.js**
- Main registration modal component
- Handles form validation and submission
- Manages IPFS upload and blockchain transaction

**App.js**
- Checks user profile on wallet connection
- Shows registration modal if needed
- Manages registration flow state

**Profile.js**
- Displays registered username prominently
- Shows wallet address linkage
- Allows editing other profile fields (not username)

### Customization

To modify registration requirements:

1. **Change username length limits:**
   ```javascript
   // In Registration.js
   maxLength={20}  // Change max length
   const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(usernameToCheck);  // Update regex
   ```

2. **Add additional fields:**
   ```javascript
   // Add new state
   const [newField, setNewField] = useState('');
   
   // Add to profileData
   const profileData = {
     username: username.trim(),
     name: name.trim(),
     newField: newField.trim(),  // Add here
     // ...
   };
   ```

3. **Disable skip option:**
   ```javascript
   // In App.js, remove onSkip prop
   <Registration 
     address={address}
     onComplete={handleRegistrationComplete}
     // onSkip={handleSkipRegistration}  // Remove this
   />
   ```

## Security Considerations

1. **Wallet Verification**
   - Username is linked to wallet address
   - Only wallet owner can register
   - Cannot steal or transfer usernames

2. **Immutability**
   - Username cannot be changed after registration
   - Prevents identity confusion
   - Ensures trust in the system

3. **Uniqueness** (Future Enhancement)
   - Current: Format validation only
   - Recommended: Add on-chain uniqueness check
   - Prevents duplicate usernames

## Future Enhancements

### Planned Features
- [ ] Username uniqueness verification
- [ ] Username search functionality
- [ ] Username mentions (@username)
- [ ] Username verification badges
- [ ] Username transfer (with restrictions)
- [ ] Reserved usernames for verified accounts

### Possible Improvements
- Add email verification (optional)
- Social media linking
- Profile verification system
- Username marketplace
- Custom username NFTs

## Troubleshooting

### Registration Not Showing
- Make sure wallet is connected
- Check that you're on Helios Testnet
- Refresh the page and reconnect

### Transaction Failed
- Ensure you have enough HLS for gas
- Check network connection
- Try again with higher gas limit

### Username Already Taken (Future)
- Choose a different username
- Add numbers or underscores
- Try variations of your desired name

## Support

For issues or questions:
1. Check browser console for errors (F12)
2. Verify wallet connection and network
3. Ensure sufficient HLS balance for gas
4. Review this documentation
5. Contact support with error details
