# New Notification Types Implementation Guide

## Overview
Three new notification types have been added to the smart contract:
- **Type 4:** Mention (when someone mentions you in a post/comment)
- **Type 5:** Reply (when someone replies to your comment)
- **Type 6:** Tag (when someone tags you in a post)

## Smart Contract Changes

### New Constants Added

```solidity
uint8 constant NOTIF_MENTION = 4;  // @username mentions
uint8 constant NOTIF_REPLY = 5;    // Comment replies
uint8 constant NOTIF_TAG = 6;      // User tags
```

### New Functions Added

#### 1. Create Mention Notification

```solidity
function createMentionNotification(
    address _mentionedUser,
    uint256 _postId
) external
```

**Purpose:** Notify a user when they are mentioned in a post or comment

**Parameters:**
- `_mentionedUser`: Address of the user being mentioned
- `_postId`: ID of the post where mention occurred

**Usage Example:**
```javascript
// When user creates a post with @username
const mentionedAddresses = extractMentions(postContent); // Your function to extract @mentions
for (const userAddress of mentionedAddresses) {
  await writeContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'createMentionNotification',
    args: [userAddress, postId],
  });
}
```

---

#### 2. Create Reply Notification

```solidity
function createReplyNotification(
    address _originalCommenter,
    uint256 _postId
) external
```

**Purpose:** Notify a user when someone replies to their comment

**Parameters:**
- `_originalCommenter`: Address of the user whose comment is being replied to
- `_postId`: ID of the post containing the comment

**Usage Example:**
```javascript
// When user replies to a comment
await writeContract({
  address: contractData.address,
  abi: contractData.abi,
  functionName: 'createReplyNotification',
  args: [originalCommenterAddress, postId],
});
```

---

#### 3. Create Tag Notification

```solidity
function createTagNotification(
    address _taggedUser,
    uint256 _postId
) external
```

**Purpose:** Notify a user when they are tagged in a post

**Parameters:**
- `_taggedUser`: Address of the user being tagged
- `_postId`: ID of the post where user is tagged

**Usage Example:**
```javascript
// When user creates a post with tagged users
const taggedAddresses = extractTags(postContent); // Your function to extract tags
for (const userAddress of taggedAddresses) {
  await writeContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'createTagNotification',
    args: [userAddress, postId],
  });
}
```

---

## Frontend Integration

### Updated Type Mapping

```javascript
const getNotificationTypeString = (typeNum) => {
  const types = [
    'like',         // 0
    'follow',       // 1
    'comment',      // 2
    'comment_like', // 3
    'mention',      // 4
    'reply',        // 5
    'tag'           // 6
  ];
  return types[typeNum] || 'unknown';
};
```

### Updated Message Mapping

```javascript
const getNotificationMessage = (type) => {
  switch (type) {
    case 'like':
      return 'liked your post';
    case 'follow':
      return 'started following you';
    case 'comment':
      return 'commented on your post';
    case 'comment_like':
      return 'liked your comment';
    case 'mention':
      return 'mentioned you in a post';
    case 'reply':
      return 'replied to your comment';
    case 'tag':
      return 'tagged you in a post';
    default:
      return 'interacted with you';
  }
};
```

### Updated Icon Mapping

```javascript
const getNotificationIcon = (type) => {
  switch (type) {
    case 'mention':
      return <AtSign size={20} className="notification-icon mention" />;
    case 'reply':
      return <MessageCircle size={20} className="notification-icon comment" />;
    case 'tag':
      return <AtSign size={20} className="notification-icon mention" />;
    // ... other cases
  }
};
```

---

## Implementation Examples

### Example 1: Mention Detection in Post Creation

```javascript
// In CreatePost.js or similar component
const handleCreatePost = async (content) => {
  // 1. Create the post first
  const tx = await writeContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'createPost',
    args: [ipfsHash],
  });
  
  await waitForTransaction(tx);
  
  // 2. Extract mentions from content
  const mentions = extractMentionsFromContent(content);
  
  // 3. Create notification for each mentioned user
  for (const mention of mentions) {
    const userAddress = await getUserAddressByUsername(mention.username);
    if (userAddress && userAddress !== address) {
      await writeContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'createMentionNotification',
        args: [userAddress, postId],
      });
    }
  }
};

// Helper function to extract @mentions
const extractMentionsFromContent = (content) => {
  const mentionRegex = /@(\w+)/g;
  const matches = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    matches.push({
      username: match[1],
      position: match.index
    });
  }
  
  return matches;
};
```

---

### Example 2: Reply Detection in Comments

```javascript
// In Comments.js or similar component
const handleAddComment = async (content, parentCommentId = null) => {
  // 1. Add the comment
  const tx = await writeContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'addComment',
    args: [postId, ipfsHash],
  });
  
  await waitForTransaction(tx);
  
  // 2. If this is a reply to another comment, notify the original commenter
  if (parentCommentId) {
    const parentComment = await getComment(parentCommentId);
    
    if (parentComment.commenter !== address) {
      await writeContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'createReplyNotification',
        args: [parentComment.commenter, postId],
      });
    }
  }
  
  // 3. Also check for mentions in the comment
  const mentions = extractMentionsFromContent(content);
  for (const mention of mentions) {
    const userAddress = await getUserAddressByUsername(mention.username);
    if (userAddress && userAddress !== address) {
      await writeContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'createMentionNotification',
        args: [userAddress, postId],
      });
    }
  }
};
```

---

### Example 3: Tag Detection in Post Creation

```javascript
// In CreatePost.js with tag input
const handleCreatePostWithTags = async (content, taggedUsers) => {
  // 1. Create the post
  const tx = await writeContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'createPost',
    args: [ipfsHash],
  });
  
  await waitForTransaction(tx);
  
  // 2. Create tag notifications
  for (const taggedUser of taggedUsers) {
    if (taggedUser.address !== address) {
      await writeContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'createTagNotification',
        args: [taggedUser.address, postId],
      });
    }
  }
};
```

---

## UI Components to Add

### 1. Mention Autocomplete

```javascript
// Component to show user suggestions when typing @
const MentionAutocomplete = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  
  // Fetch users matching query
  useEffect(() => {
    if (query.length > 0) {
      fetchMatchingUsers(query).then(setUsers);
    }
  }, [query]);
  
  return (
    <div className="mention-autocomplete">
      {users.map(user => (
        <div 
          key={user.address}
          onClick={() => onSelect(user)}
          className="mention-suggestion"
        >
          <img src={user.profileImage} alt={user.username} />
          <span>@{user.username}</span>
        </div>
      ))}
    </div>
  );
};
```

---

### 2. Tag Input Component

```javascript
// Component to select users to tag
const TagInput = ({ onTagsChange }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleAddTag = (user) => {
    const updated = [...selectedUsers, user];
    setSelectedUsers(updated);
    onTagsChange(updated);
  };
  
  const handleRemoveTag = (userAddress) => {
    const updated = selectedUsers.filter(u => u.address !== userAddress);
    setSelectedUsers(updated);
    onTagsChange(updated);
  };
  
  return (
    <div className="tag-input">
      <div className="selected-tags">
        {selectedUsers.map(user => (
          <div key={user.address} className="tag-chip">
            <span>@{user.username}</span>
            <button onClick={() => handleRemoveTag(user.address)}>×</button>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Tag users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {/* Show user search results */}
    </div>
  );
};
```

---

### 3. Reply Thread Indicator

```javascript
// Component to show reply thread
const CommentWithReplies = ({ comment, onReply }) => {
  return (
    <div className="comment-thread">
      <div className="comment-main">
        <CommentContent comment={comment} />
        <button onClick={() => onReply(comment)}>
          Reply
        </button>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(reply => (
            <div key={reply.id} className="comment-reply">
              <CommentContent comment={reply} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## Testing Scenarios

### Test 1: Mention Notification
```
1. User A creates a post with content: "Hey @userB, check this out!"
2. System extracts @userB mention
3. System calls createMentionNotification(userB_address, postId)
4. User B receives notification: "User A mentioned you in a post"
5. User B clicks notification → navigates to the post
```

### Test 2: Reply Notification
```
1. User A comments on a post
2. User B replies to User A's comment
3. System calls createReplyNotification(userA_address, postId)
4. User A receives notification: "User B replied to your comment"
5. User A clicks notification → navigates to the comment thread
```

### Test 3: Tag Notification
```
1. User A creates a post and tags User B
2. System calls createTagNotification(userB_address, postId)
3. User B receives notification: "User A tagged you in a post"
4. User B clicks notification → navigates to the post
```

---

## Deployment Steps

### 1. Deploy Updated Smart Contract

```bash
# Compile the contract
npx hardhat compile

# Deploy to Helios Testnet
npx hardhat run scripts/deploy.js --network helios-testnet

# Update contract address in frontend
# Update .env file with new contract address
```

### 2. Update Frontend

```bash
# The frontend changes are already committed
# Just need to rebuild and redeploy

cd frontend
npm run build
vercel --prod
```

### 3. Update ABI

Make sure to copy the new ABI to the frontend:

```bash
# Copy ABI from artifacts
cp artifacts/contracts/SocialFeed.sol/SocialFeed.json frontend/src/contracts/
```

---

## Gas Costs

Estimated gas costs for new functions:

- `createMentionNotification`: ~50,000 gas
- `createReplyNotification`: ~50,000 gas
- `createTagNotification`: ~50,000 gas

**Note:** These are additional costs on top of the main action (creating post/comment).

---

## Best Practices

### 1. Batch Notifications
If multiple users are mentioned/tagged, batch the notifications:

```javascript
// Instead of multiple transactions
for (const user of users) {
  await createNotification(user); // ❌ Expensive
}

// Better: Create a batch function or use Promise.all
await Promise.all(
  users.map(user => createNotification(user))
); // ✅ Better
```

### 2. Validate Before Notifying
Always check:
- User exists and has a profile
- Not notifying yourself
- User hasn't blocked notifications

### 3. Rate Limiting
Consider implementing rate limiting to prevent spam:
- Max 10 mentions per post
- Max 5 tags per post
- Cooldown period between notifications

---

## Summary

✅ **3 New Notification Types** added to smart contract  
✅ **Frontend Integration** complete with icons and messages  
✅ **Public Functions** available for creating notifications  
✅ **Gas Optimized** using existing notification structure  
✅ **Event Emission** for real-time updates  
✅ **Ready to Deploy** after contract redeployment  

**Next Steps:**
1. Deploy updated smart contract
2. Update contract address in frontend
3. Implement mention/tag detection in CreatePost component
4. Implement reply detection in Comments component
5. Test all notification types
6. Deploy to production
