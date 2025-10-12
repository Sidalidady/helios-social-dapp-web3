# Blockchain Notification Types

## Overview
The smart contract automatically creates notifications for various user interactions. All notifications are stored on-chain and retrieved via the `getUserNotifications()` function.

## Notification Structure

```solidity
struct Notification {
    address sender;           // Who triggered the notification
    uint96 timestamp;         // When it was created
    uint8 notificationType;   // Type of notification (0-3)
    bool read;                // Whether user has read it
    uint32 relatedId;         // Related post/comment ID
}
```

## 4 Types of Notifications

### 1. **LIKE Notification** (Type 0)
**Trigger:** When someone likes your post  
**Smart Contract Constant:** `NOTIF_LIKE = 0`  
**Frontend Type:** `'like'`

**When Created:**
- Function: `likePost(uint256 _postId)`
- Condition: Liker is NOT the post author
- Recipient: Post author
- Related ID: Post ID

**Message:** "liked your post"

**Example:**
```
User A creates a post
User B likes the post
→ User A receives notification: "User B liked your post"
```

---

### 2. **FOLLOW Notification** (Type 1)
**Trigger:** When someone follows you  
**Smart Contract Constant:** `NOTIF_FOLLOW = 1`  
**Frontend Type:** `'follow'`

**When Created:**
- Function: `followUser(address _userToFollow)`
- Condition: Always created (unless following yourself)
- Recipient: User being followed
- Related ID: 0 (no related post)

**Message:** "started following you"

**Example:**
```
User B follows User A
→ User A receives notification: "User B started following you"
```

---

### 3. **COMMENT Notification** (Type 2)
**Trigger:** When someone comments on your post  
**Smart Contract Constant:** `NOTIF_COMMENT = 2`  
**Frontend Type:** `'comment'`

**When Created:**
- Function: `addComment(uint256 _postId, string memory _ipfsHash)`
- Condition: Commenter is NOT the post author
- Recipient: Post author
- Related ID: Post ID

**Message:** "commented on your post"

**Example:**
```
User A creates a post
User B comments on the post
→ User A receives notification: "User B commented on your post"
```

---

### 4. **COMMENT LIKE Notification** (Type 3)
**Trigger:** When someone likes your comment  
**Smart Contract Constant:** `NOTIF_COMMENT_LIKE = 3`  
**Frontend Type:** `'comment_like'`

**When Created:**
- Function: `likeComment(uint256 _postId, uint256 _commentId)`
- Condition: Liker is NOT the comment author
- Recipient: Comment author
- Related ID: Post ID

**Message:** "liked your comment"

**Example:**
```
User A comments on a post
User B likes User A's comment
→ User A receives notification: "User B liked your comment"
```

---

## Smart Contract Functions

### Reading Notifications

```solidity
// Get all notifications for a user
function getUserNotifications(address _user) 
    external view returns (Notification[] memory)

// Get count of unread notifications
function getUnreadNotificationCount(address _user) 
    external view returns (uint256)
```

### Managing Notifications

```solidity
// Mark a notification as read
function markNotificationAsRead(uint256 _notificationIndex) external

// Clear old notifications (keep last N)
function clearOldNotifications(uint256 _keepCount) external
```

### Events

```solidity
event NotificationCreated(
    address indexed recipient,
    address indexed sender,
    string notificationType,
    uint256 relatedId,
    uint256 timestamp
);

event NotificationRead(
    address indexed user,
    uint256 notificationIndex
);
```

---

## Frontend Implementation

### Type Mapping in Frontend

```javascript
const getNotificationTypeString = (typeNum) => {
    const types = ['like', 'follow', 'comment', 'comment_like'];
    return types[typeNum] || 'unknown';
};
```

### Message Mapping

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
        default:
            return 'interacted with you';
    }
};
```

### Icons

- **Like:** ❤️ Heart icon
- **Follow:** 👤 User icon
- **Comment:** 💬 Message icon
- **Comment Like:** ❤️💬 Heart + Message icon

---

## Notification Flow

```
User Action (like, follow, comment, etc.)
        ↓
Smart Contract Function Called
        ↓
Validation (don't notify yourself)
        ↓
_createNotification() Internal Function
        ↓
Notification Stored in userNotifications[recipient]
        ↓
NotificationCreated Event Emitted
        ↓
Frontend Detects Event
        ↓
Refetches Notifications from Blockchain
        ↓
Updates UI (Badge Count + Notification List)
```

---

## Gas Optimization

The notification system is optimized for gas efficiency:

1. **Packed Storage:** Notification struct uses optimized data types
   - `uint96` for timestamp (saves gas vs uint256)
   - `uint8` for notification type (only 4 types needed)
   - `uint32` for related ID (supports 4 billion posts)

2. **No Self-Notifications:** Checks prevent notifying yourself
   ```solidity
   if (posts[_postId].author != msg.sender) {
       _createNotification(...);
   }
   ```

3. **Batch Operations:** Can clear old notifications to save storage

---

## Current Limitations

1. **No Mention Notifications:** @mentions in comments are not tracked on-chain
2. **No Reply Notifications:** Comment replies don't trigger separate notifications
3. **No Repost Notifications:** No repost/share feature yet
4. **Fixed Types:** Only 4 notification types (extensible to 256 with uint8)

---

## Future Enhancements

Potential notification types to add:

- **Type 4:** Mention in post/comment
- **Type 5:** Reply to comment
- **Type 6:** Post shared/reposted
- **Type 7:** Profile viewed
- **Type 8:** Tagged in post
- **Type 9:** Milestone achieved (100 followers, etc.)

---

## Testing Notifications

### How to Test Each Type

1. **Like Notification:**
   ```
   - User A creates a post
   - User B calls likePost(postId)
   - User A should see notification
   ```

2. **Follow Notification:**
   ```
   - User B calls followUser(userA_address)
   - User A should see notification
   ```

3. **Comment Notification:**
   ```
   - User A creates a post
   - User B calls addComment(postId, ipfsHash)
   - User A should see notification
   ```

4. **Comment Like Notification:**
   ```
   - User A comments on a post
   - User B calls likeComment(postId, commentId)
   - User A should see notification
   ```

---

## Summary

✅ **4 Notification Types** stored on blockchain  
✅ **Automatic Creation** when users interact  
✅ **Gas Optimized** storage structure  
✅ **Read/Unread Tracking** built-in  
✅ **Event Emission** for real-time updates  
✅ **Frontend Integration** via wagmi hooks  

All notifications are **permanent on-chain records** that can be queried at any time!
