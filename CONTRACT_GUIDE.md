# Smart Contract Interaction Guide

## Contract Address
After deployment, your contract will be at: `0xYourContractAddress`

## Using Hardhat Console

```bash
npx hardhat console --network helios
```

### Get Contract Instance

```javascript
const SocialFeed = await ethers.getContractFactory("SocialFeed");
const contract = SocialFeed.attach("YOUR_CONTRACT_ADDRESS");
```

### Read Functions (Free)

#### Get Total Posts
```javascript
const total = await contract.getTotalPosts();
console.log("Total posts:", total.toString());
```

#### Get Recent Posts
```javascript
const posts = await contract.getRecentPosts(0, 10); // offset, limit
console.log("Recent posts:", posts);
```

#### Get User Posts
```javascript
const userPosts = await contract.getUserPosts("0xUserAddress");
console.log("User posts:", userPosts);
```

#### Check Like Status
```javascript
const hasLiked = await contract.hasLiked(1, "0xUserAddress"); // postId, user
console.log("Has liked:", hasLiked);
```

#### Check Follow Status
```javascript
const isFollowing = await contract.isFollowing("0xFollower", "0xFollowing");
console.log("Is following:", isFollowing);
```

#### Get User Profile
```javascript
const profile = await contract.getUserProfile("0xUserAddress");
console.log("Profile:", profile);
```

### Write Functions (Costs Gas)

#### Create Post
```javascript
const tx = await contract.createPost("QmYourIPFSHash");
await tx.wait();
console.log("Post created!");
```

#### Like Post
```javascript
const tx = await contract.likePost(1); // postId
await tx.wait();
console.log("Post liked!");
```

#### Unlike Post
```javascript
const tx = await contract.unlikePost(1); // postId
await tx.wait();
console.log("Post unliked!");
```

#### Follow User
```javascript
const tx = await contract.followUser("0xUserAddress");
await tx.wait();
console.log("User followed!");
```

#### Unfollow User
```javascript
const tx = await contract.unfollowUser("0xUserAddress");
await tx.wait();
console.log("User unfollowed!");
```

#### Update Profile
```javascript
const tx = await contract.updateProfile("DisplayName", "QmProfileIPFSHash");
await tx.wait();
console.log("Profile updated!");
```

## Using Ethers.js (Frontend)

### Setup
```javascript
import { ethers } from 'ethers';
import contractData from './contracts/SocialFeed.json';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(
  contractData.address,
  contractData.abi,
  signer
);
```

### Create Post
```javascript
async function createPost(ipfsHash) {
  const tx = await contract.createPost(ipfsHash);
  await tx.wait();
  return tx;
}
```

### Listen to Events
```javascript
// Listen for new posts
contract.on("PostCreated", (postId, author, ipfsHash, timestamp) => {
  console.log(`New post ${postId} by ${author}`);
});

// Listen for likes
contract.on("PostLiked", (postId, liker, newLikeCount) => {
  console.log(`Post ${postId} liked by ${liker}`);
});

// Listen for follows
contract.on("UserFollowed", (follower, following) => {
  console.log(`${follower} followed ${following}`);
});
```

## Using Wagmi (React Hooks)

### Read Contract
```javascript
import { useReadContract } from 'wagmi';
import contractData from './contracts/SocialFeed.json';

function MyComponent() {
  const { data: posts } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getRecentPosts',
    args: [0n, 50n],
  });
  
  return <div>{/* render posts */}</div>;
}
```

### Write Contract
```javascript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

function CreatePostButton() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading } = useWaitForTransactionReceipt({ hash });
  
  const handlePost = () => {
    writeContract({
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'createPost',
      args: ['QmIPFSHash'],
    });
  };
  
  return (
    <button onClick={handlePost} disabled={isLoading}>
      {isLoading ? 'Posting...' : 'Post'}
    </button>
  );
}
```

### Watch Events
```javascript
import { useWatchContractEvent } from 'wagmi';

function FeedComponent() {
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'PostCreated',
    onLogs(logs) {
      console.log('New posts:', logs);
      // Refresh feed
    },
  });
  
  return <div>{/* feed */}</div>;
}
```

## Contract Events

### PostCreated
```solidity
event PostCreated(
  uint256 indexed postId,
  address indexed author,
  string ipfsHash,
  uint256 timestamp
);
```

### PostLiked / PostUnliked
```solidity
event PostLiked(
  uint256 indexed postId,
  address indexed liker,
  uint256 newLikeCount
);

event PostUnliked(
  uint256 indexed postId,
  address indexed unliker,
  uint256 newLikeCount
);
```

### UserFollowed / UserUnfollowed
```solidity
event UserFollowed(
  address indexed follower,
  address indexed following
);

event UserUnfollowed(
  address indexed follower,
  address indexed unfollowing
);
```

### ProfileUpdated
```solidity
event ProfileUpdated(
  address indexed user,
  string displayName,
  string profileIpfsHash
);
```

## Gas Estimates

Approximate gas costs on Helios Testnet:

- **createPost**: ~100,000 gas
- **likePost**: ~50,000 gas
- **unlikePost**: ~30,000 gas
- **followUser**: ~80,000 gas
- **unfollowUser**: ~50,000 gas
- **updateProfile**: ~70,000 gas

*Actual costs may vary based on network conditions*

## Error Handling

### Common Errors

**"IPFS hash cannot be empty"**
- Ensure you provide a valid IPFS hash when creating posts

**"Post does not exist"**
- Check that the post ID is valid

**"Already liked"**
- User has already liked this post, use unlikePost instead

**"Cannot follow yourself"**
- Cannot follow your own address

**"Already following"**
- User is already following this address

### Try-Catch Pattern

```javascript
try {
  const tx = await contract.createPost(ipfsHash);
  await tx.wait();
  console.log('Success!');
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    console.log('User rejected transaction');
  } else {
    console.error('Transaction failed:', error.message);
  }
}
```

## Testing Locally

### Start Local Node
```bash
npx hardhat node
```

### Deploy Locally
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Interact
```bash
npx hardhat console --network localhost
```

## Best Practices

1. **Always wait for transactions**
   ```javascript
   const tx = await contract.createPost(hash);
   await tx.wait(); // Wait for confirmation
   ```

2. **Handle errors gracefully**
   ```javascript
   try {
     // transaction
   } catch (error) {
     // handle error
   }
   ```

3. **Use events for updates**
   - More efficient than polling
   - Real-time updates

4. **Validate inputs**
   - Check IPFS hash format
   - Verify addresses
   - Ensure non-empty strings

5. **Optimize reads**
   - Use pagination
   - Cache results
   - Batch requests

## Security Considerations

- Never expose private keys
- Validate all user inputs
- Check transaction success
- Monitor gas prices
- Use recent block numbers
- Implement rate limiting

## Resources

- [Ethers.js Docs](https://docs.ethers.org/)
- [Wagmi Docs](https://wagmi.sh/)
- [Hardhat Docs](https://hardhat.org/docs)
- [Solidity Docs](https://docs.soliditylang.org/)
