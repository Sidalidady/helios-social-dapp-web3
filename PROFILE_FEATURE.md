# 👤 Profile Feature Documentation

## Overview
The profile editing feature allows users to customize their identity on Helios Social by setting a username, bio, and profile image.

## Features

### ✨ What Users Can Edit:
1. **Username** (max 30 characters)
   - Displayed on all posts
   - Stored on-chain
   
2. **Bio** (max 160 characters)
   - Personal description
   - Stored in IPFS
   
3. **Profile Image** (max 5MB)
   - Supports JPG, PNG, GIF
   - Stored in IPFS
   - Preview before upload

## How It Works

### Smart Contract Integration
The profile data is stored using the existing `updateProfile` function in the `SocialFeed` contract:

```solidity
function updateProfile(string memory _username, string memory _ipfsHash) external
```

- **Username**: Stored directly on-chain
- **Bio & Image**: Stored in IPFS, hash stored on-chain

### Data Flow
1. User fills out profile form
2. Profile data (username, bio, image) is packaged as JSON
3. JSON is uploaded to IPFS
4. IPFS hash is stored on blockchain via `updateProfile`
5. Transaction confirmed
6. Profile updated!

## Usage

### For Users:
1. **Connect your wallet** (if not already connected)
2. **Click "Profile" button** in the header
3. **Fill in your details:**
   - Enter username
   - Write a bio
   - Upload a profile image (optional)
4. **Click "Save Profile"**
5. **Confirm transaction** in MetaMask
6. **Wait for confirmation** (a few seconds)
7. **Done!** Your profile is updated

### UI Components

#### Profile Modal
- **Location**: Appears as overlay when "Profile" button is clicked
- **Features**:
  - Image upload with preview
  - Character counters for username and bio
  - Real-time validation
  - Loading states during upload/transaction
  - Error handling

#### Profile Button
- **Location**: Header, next to wallet address
- **Visibility**: Only shown when wallet is connected
- **Icon**: User icon
- **Responsive**: Text hidden on mobile

## Technical Details

### Files Created:
1. `frontend/src/components/Profile.js` - Main profile component
2. `frontend/src/components/Profile.css` - Profile styling
3. Updated `frontend/src/components/Header.js` - Added profile button
4. Updated `frontend/src/components/Header.css` - Profile button styles

### Dependencies:
- **wagmi**: For blockchain interactions
- **lucide-react**: For icons
- **IPFS utils**: For decentralized storage

### State Management:
```javascript
const [username, setUsername] = useState('');
const [bio, setBio] = useState('');
const [profileImage, setProfileImage] = useState(null);
const [imagePreview, setImagePreview] = useState('');
const [isUploading, setIsUploading] = useState(false);
```

### Hooks Used:
- `useAccount()` - Get connected wallet address
- `useWriteContract()` - Write to blockchain
- `useWaitForTransactionReceipt()` - Wait for confirmation
- `useReadContract()` - Read existing profile

## IPFS Storage Format

Profile data is stored as JSON in IPFS:

```json
{
  "username": "YourUsername",
  "bio": "Your bio text here",
  "address": "0x...",
  "timestamp": 1234567890,
  "image": "data:image/png;base64,..." // Base64 encoded image
}
```

## Validation Rules

### Username:
- ✅ Required
- ✅ Max 30 characters
- ✅ Trimmed (no leading/trailing spaces)

### Bio:
- ✅ Optional
- ✅ Max 160 characters
- ✅ Trimmed

### Profile Image:
- ✅ Optional
- ✅ Max 5MB file size
- ✅ Formats: JPG, PNG, GIF
- ✅ Preview before upload

## Error Handling

The profile feature handles various error scenarios:

1. **Wallet Not Connected**
   - Alert: "Please connect your wallet first"
   
2. **Empty Username**
   - Alert: "Please enter a username"
   
3. **Image Too Large**
   - Alert: "Image size should be less than 5MB"
   
4. **Upload Failed**
   - Alert: "Failed to update profile: [error message]"
   - Console error logged
   
5. **Transaction Failed**
   - Wagmi handles transaction errors
   - User can retry

## Responsive Design

### Desktop (>768px):
- Full profile button with icon and text
- Large profile image preview (120px)
- Wide modal (max 500px)

### Tablet (640px - 768px):
- Profile button shows icon only
- Medium profile image preview

### Mobile (<640px):
- Compact layout
- Smaller profile image (100px)
- Reduced padding
- Modal takes 95% width

## Future Enhancements

### Potential Additions:
1. **Profile Viewing**
   - View other users' profiles
   - Click on username to see profile
   
2. **Profile Stats**
   - Total posts
   - Total likes received
   - Followers count
   
3. **Social Features**
   - Follow/unfollow from profile
   - View user's posts
   
4. **Advanced Customization**
   - Cover image
   - Social links
   - Custom themes
   
5. **NFT Profile Pictures**
   - Use owned NFTs as profile pictures
   - Verify NFT ownership
   
6. **Profile Verification**
   - Verified badge for notable users
   - ENS integration

## Gas Costs

Updating profile requires:
- **Gas for transaction**: ~50,000 - 100,000 gas
- **Cost on Helios Testnet**: Minimal (test HLS)
- **Cost on Mainnet**: Will vary based on network conditions

## Security Considerations

1. **Private Key Safety**
   - Never expose private keys
   - Users sign transactions via MetaMask
   
2. **IPFS Content**
   - Content is public on IPFS
   - Don't upload sensitive information
   
3. **Image Validation**
   - Client-side size validation
   - Consider adding server-side validation for production
   
4. **Rate Limiting**
   - Consider adding cooldown between profile updates
   - Prevent spam/abuse

## Testing Checklist

- [ ] Connect wallet
- [ ] Open profile modal
- [ ] Enter username (test max length)
- [ ] Enter bio (test max length)
- [ ] Upload image (test size limit)
- [ ] Preview image displays correctly
- [ ] Save profile triggers transaction
- [ ] Transaction confirms successfully
- [ ] Profile data persists
- [ ] Close modal works
- [ ] Responsive on mobile
- [ ] Error handling works

## Support

For issues or questions:
1. Check browser console for errors (F12)
2. Verify wallet is connected
3. Ensure sufficient HLS balance for gas
4. Check MetaMask is on Helios Testnet
5. Review transaction on Helios Explorer

---

**Profile Feature Status**: ✅ Complete and Ready to Use!

Built with ❤️ for Helios Social
