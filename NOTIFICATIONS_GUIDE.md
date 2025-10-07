# Notifications System Guide

## Overview

Your Helios Social platform now has a complete notification system that alerts users when:
- Someone follows them
- A followed user creates a new post
- Someone likes their post
- Someone comments on their post

## Features

### Notification Types

1. **Follow Notifications** 👤
   - When someone follows you
   - Shows follower's username and profile picture

2. **New Post Notifications** 📄
   - When someone you follow posts
   - Shows author and post preview

3. **Like Notifications** ❤️
   - When someone likes your post
   - Shows who liked it

4. **Comment Notifications** 💬
   - When someone comments on your post
   - Shows commenter and comment preview

### UI Features

✅ **Bell Icon** - In header with unread count badge
✅ **Dropdown Panel** - Click bell to view all notifications
✅ **Unread Indicators** - Blue dot for unread notifications
✅ **User Avatars** - Shows profile pictures
✅ **Timestamps** - When notification occurred
✅ **Mark as Read** - Click notification to mark as read
✅ **Clear All** - Button to clear all notifications

## How to Use

### For Users

**View Notifications:**
1. Look for bell icon in header (top right)
2. Red badge shows unread count
3. Click bell to open notifications panel

**Read Notifications:**
- Click any notification to mark as read
- Unread notifications have blue background
- Blue dot indicates unread status

**Clear Notifications:**
- Click "Clear all" button to remove all
- Notifications auto-update every 10 seconds

### For Developers

**Add Notification:**
```javascript
import { addNotification } from './components/Notifications';

// When someone follows
addNotification(followedUserAddress, {
  type: 'follow',
  from: followerAddress,
  message: 'started following you',
});

// When someone posts
addNotification(followerAddress, {
  type: 'post',
  from: authorAddress,
  message: 'created a new post',
});

// When someone likes
addNotification(postAuthorAddress, {
  type: 'like',
  from: likerAddress,
  message: 'liked your post',
});

// When someone comments
addNotification(postAuthorAddress, {
  type: 'comment',
  from: commenterAddress,
  message: 'commented on your post',
});
```

**Get Unread Count:**
```javascript
import { getUnreadCount } from './components/Notifications';

const count = getUnreadCount(userAddress);
console.log('Unread notifications:', count);
```

## Storage

Notifications are stored in **localStorage**:
- Key: `notifications_{userAddress}`
- Format: JSON array of notification objects
- Limit: Last 50 notifications per user
- Persists across browser sessions

## Notification Object Structure

```json
{
  "id": 1234567890,
  "type": "follow",
  "from": "0x1234...5678",
  "message": "started following you",
  "timestamp": 1234567890,
  "read": false
}
```

## Integration Points

### Where to Add Notifications

**1. Follow System** (when implemented):
```javascript
// In follow function
const handleFollow = async (targetAddress) => {
  // ... follow logic ...
  
  // Notify the followed user
  addNotification(targetAddress, {
    type: 'follow',
    from: address,
    message: 'started following you',
  });
};
```

**2. Post Creation** (in CreatePost.js):
```javascript
// After post is created
const handlePostCreated = () => {
  // Get list of followers
  const followers = getFollowers(address);
  
  // Notify each follower
  followers.forEach(follower => {
    addNotification(follower, {
      type: 'post',
      from: address,
      message: 'created a new post',
    });
  });
};
```

**3. Like System** (in Post.js):
```javascript
// After liking a post
const handleLike = async () => {
  // ... like logic ...
  
  // Notify post author
  if (post.author !== address) {
    addNotification(post.author, {
      type: 'like',
      from: address,
      message: 'liked your post',
    });
  }
};
```

**4. Comment System** (in Comments.js):
```javascript
// After commenting
const handleComment = async () => {
  // ... comment logic ...
  
  // Notify post author
  addNotification(postAuthor, {
    type: 'comment',
    from: address,
    message: 'commented on your post',
  });
};
```

## Styling

Notifications use your app's color scheme:
- **Follow**: Blue (#60a5fa)
- **Post**: Purple (#a78bfa)
- **Like**: Red (#f87171)
- **Comment**: Green (#34d399)

## Future Enhancements

Possible improvements:
- [ ] Push notifications (browser API)
- [ ] Email notifications
- [ ] Notification preferences/settings
- [ ] Mute specific users
- [ ] Group similar notifications
- [ ] Real-time updates (WebSocket)
- [ ] Notification history page
- [ ] Export notifications

## Troubleshooting

**Notifications not showing:**
- Check localStorage is enabled
- Verify user address is correct
- Check browser console for errors

**Badge count wrong:**
- Clear localStorage and refresh
- Check notification data format

**Dropdown not appearing:**
- Check z-index conflicts
- Verify position: relative on parent

## Testing

**Test Notifications:**
```javascript
// Open browser console
import { addNotification } from './components/Notifications';

// Add test notification
addNotification('YOUR_ADDRESS', {
  type: 'follow',
  from: '0x1234567890123456789012345678901234567890',
  message: 'Test notification',
});
```

Your notification system is now fully functional! Users will be alerted when they're followed or when followed users post. 🔔✨
