# 🔔 Web3 Notification System Guide

## Current Implementation vs Better Solutions

### ❌ Current: localStorage
- Limited to 5-10MB
- Doesn't sync across devices
- Can be cleared by user
- No real-time sync between tabs
- No push notifications

### ✅ Better Solutions

---

## **Option 1: IndexedDB (Quick Upgrade)**

### Benefits:
- ✅ **Larger storage** - Up to 50% of disk space
- ✅ **Structured data** - Better than JSON strings
- ✅ **Indexes** - Fast queries
- ✅ **Transactions** - Data integrity
- ✅ **Better performance** - Async operations

### Implementation:
Already created in `frontend/src/utils/notificationDB.js`

### Usage:
```javascript
import { 
  saveNotification, 
  getNotifications, 
  getUnreadCount,
  markAsRead 
} from '../utils/notificationDB';

// Save notification
await saveNotification(userAddress, {
  type: 'like',
  from: '0x123...',
  message: 'liked your post',
  timestamp: Date.now(),
  read: false
});

// Get all notifications
const notifications = await getNotifications(userAddress);

// Get unread count
const unreadCount = await getUnreadCount(userAddress);

// Mark as read
await markAsRead(notificationId);
```

---

## **Option 2: IPFS + Smart Contract (True Web3)**

### Architecture:
```
User Action (Like/Follow)
    ↓
Smart Contract Event
    ↓
Store metadata on IPFS
    ↓
Emit event with IPFS hash
    ↓
Frontend listens to event
    ↓
Fetch from IPFS
    ↓
Cache in IndexedDB
```

### Smart Contract Changes:
```solidity
// Add notification event
event NotificationCreated(
    address indexed recipient,
    address indexed sender,
    string notificationType,
    string ipfsHash,
    uint256 timestamp
);

// Emit when someone likes a post
function likePost(uint256 postId) external {
    // ... existing code ...
    
    // Create notification for post author
    emit NotificationCreated(
        post.author,
        msg.sender,
        "like",
        "", // Can store additional data on IPFS
        block.timestamp
    );
}

// Emit when someone follows
function followUser(address userToFollow) external {
    // ... existing code ...
    
    emit NotificationCreated(
        userToFollow,
        msg.sender,
        "follow",
        "",
        block.timestamp
    );
}
```

### Frontend Implementation:
```javascript
useWatchContractEvent({
  eventName: 'NotificationCreated',
  onLogs: async (logs) => {
    for (const log of logs) {
      if (log.args.recipient.toLowerCase() === address.toLowerCase()) {
        // Save to IndexedDB
        await saveNotification(address, {
          type: log.args.notificationType,
          from: log.args.sender,
          timestamp: Number(log.args.timestamp) * 1000,
          read: false
        });
      }
    }
  }
});
```

### Benefits:
- ✅ Fully decentralized
- ✅ Works across all devices
- ✅ Permanent record on blockchain
- ✅ Can't be deleted
- ✅ True Web3 solution

---

## **Option 3: The Graph Protocol (Best for Querying)**

### What is The Graph?
- Indexes blockchain data
- Provides GraphQL API
- Real-time subscriptions
- Fast queries

### Setup Steps:

1. **Create Subgraph Schema** (`schema.graphql`):
```graphql
type Notification @entity {
  id: ID!
  recipient: Bytes!
  sender: Bytes!
  type: String!
  postId: BigInt
  timestamp: BigInt!
  read: Boolean!
}

type User @entity {
  id: ID!
  address: Bytes!
  notifications: [Notification!]! @derivedFrom(field: "recipient")
  unreadCount: Int!
}
```

2. **Create Mapping** (`mapping.ts`):
```typescript
export function handleNotificationCreated(event: NotificationCreated): void {
  let notification = new Notification(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  
  notification.recipient = event.params.recipient;
  notification.sender = event.params.sender;
  notification.type = event.params.notificationType;
  notification.timestamp = event.block.timestamp;
  notification.read = false;
  
  notification.save();
  
  // Update user's unread count
  let user = User.load(event.params.recipient.toHex());
  if (user == null) {
    user = new User(event.params.recipient.toHex());
    user.address = event.params.recipient;
    user.unreadCount = 0;
  }
  user.unreadCount = user.unreadCount + 1;
  user.save();
}
```

3. **Query in Frontend**:
```javascript
import { useQuery, gql } from '@apollo/client';

const GET_NOTIFICATIONS = gql`
  query GetNotifications($user: Bytes!) {
    notifications(
      where: { recipient: $user }
      orderBy: timestamp
      orderDirection: desc
      first: 50
    ) {
      id
      sender
      type
      timestamp
      read
    }
  }
`;

function Notifications() {
  const { data, loading } = useQuery(GET_NOTIFICATIONS, {
    variables: { user: address }
  });
  
  return (
    <div>
      {data?.notifications.map(notif => (
        <NotificationItem key={notif.id} notification={notif} />
      ))}
    </div>
  );
}
```

### Benefits:
- ✅ Lightning fast queries
- ✅ Complex filtering
- ✅ Real-time subscriptions
- ✅ No backend needed
- ✅ Industry standard

### Cost:
- Free for development
- ~$100-500/month for production (depending on usage)

---

## **Option 4: Push Protocol (EPNS) - Real Push Notifications**

### What is Push Protocol?
- Web3 native push notifications
- Works when app is closed
- Cross-platform (web, mobile, extension)
- Decentralized

### Setup Steps:

1. **Install SDK**:
```bash
npm install @pushprotocol/restapi
```

2. **Create Channel** (one-time):
```javascript
import * as PushAPI from '@pushprotocol/restapi';

// Create notification channel
await PushAPI.channels.create({
  signer: signer,
  channelName: 'Helios Social',
  channelDescription: 'Get notified about likes, follows, and comments',
  channelURL: 'https://helios-social.vercel.app',
  channelIcon: 'https://helios-social.vercel.app/logo.png'
});
```

3. **Send Notification**:
```javascript
// When someone likes your post
await PushAPI.payloads.sendNotification({
  signer: signer,
  type: 3, // targeted notification
  identityType: 2, // direct payload
  notification: {
    title: 'New Like!',
    body: `@${username} liked your post`
  },
  payload: {
    title: 'New Like!',
    body: `@${username} liked your post`,
    cta: `https://helios-social.vercel.app/post/${postId}`,
    img: profileImage
  },
  recipients: `eip155:42000:${postAuthorAddress}`, // Helios Testnet
  channel: `eip155:42000:${channelAddress}`
});
```

4. **Subscribe to Notifications**:
```javascript
// User opts in to receive notifications
await PushAPI.channels.subscribe({
  signer: signer,
  channelAddress: `eip155:42000:${channelAddress}`,
  userAddress: `eip155:42000:${userAddress}`
});
```

### Benefits:
- ✅ Real push notifications
- ✅ Works when app is closed
- ✅ Mobile support
- ✅ Browser extension
- ✅ Decentralized
- ✅ Free for users

### Cost:
- Free tier: 1000 notifications/month
- Pro: $99/month for unlimited

---

## **🎯 Recommended Implementation Strategy**

### **Phase 1: Quick Win (This Week)**
1. ✅ Migrate from localStorage to IndexedDB
2. ✅ Better performance immediately
3. ✅ No breaking changes

### **Phase 2: Add Smart Contract Events (Next Week)**
1. Update smart contract to emit notification events
2. Listen to events in frontend
3. Store in IndexedDB
4. Works across devices!

### **Phase 3: Add The Graph (Optional)**
1. Create subgraph
2. Index all notifications
3. Fast queries and filtering
4. Professional solution

### **Phase 4: Add Push Protocol (Future)**
1. Create Push channel
2. Send push notifications
3. Users get notified even when app is closed
4. Best user experience

---

## **Comparison Table**

| Feature | localStorage | IndexedDB | IPFS + Events | The Graph | Push Protocol |
|---------|-------------|-----------|---------------|-----------|---------------|
| Storage Size | 5-10MB | 50% disk | Unlimited | Unlimited | N/A |
| Cross-device | ❌ | ❌ | ✅ | ✅ | ✅ |
| Real-time | ❌ | ❌ | ✅ | ✅ | ✅ |
| Push Notifs | ❌ | ❌ | ❌ | ❌ | ✅ |
| Decentralized | ❌ | ❌ | ✅ | ✅ | ✅ |
| Cost | Free | Free | Free | $100-500/mo | $0-99/mo |
| Complexity | Easy | Easy | Medium | Medium | Medium |
| Setup Time | 0 | 1 hour | 1 day | 2 days | 1 day |

---

## **Code Examples**

### **Migrate Notifications.js to IndexedDB**

Replace localStorage calls with IndexedDB:

```javascript
// OLD (localStorage)
const stored = localStorage.getItem(`notifications_${address}`);
const notifications = stored ? JSON.parse(stored) : [];

// NEW (IndexedDB)
import { getNotifications } from '../utils/notificationDB';
const notifications = await getNotifications(address);
```

```javascript
// OLD (localStorage)
localStorage.setItem(`notifications_${address}`, JSON.stringify(updated));

// NEW (IndexedDB)
import { saveNotification } from '../utils/notificationDB';
await saveNotification(address, notification);
```

---

## **Next Steps**

1. **Immediate**: Implement IndexedDB (file already created)
2. **This Week**: Update Notifications.js to use IndexedDB
3. **Next Week**: Add smart contract events
4. **Future**: Consider The Graph or Push Protocol

---

## **Resources**

- **IndexedDB**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **The Graph**: https://thegraph.com/docs/
- **Push Protocol**: https://push.org/docs/
- **IPFS**: https://docs.ipfs.tech/

---

## **Questions?**

- Want to implement IndexedDB now? ✅ File ready!
- Want to add smart contract events? Let me know!
- Want to integrate The Graph? I can help!
- Want push notifications? We can add Push Protocol!

Choose based on your priorities:
- **Quick win**: IndexedDB (1 hour)
- **Best Web3**: Smart Contract Events (1 day)
- **Best queries**: The Graph (2 days)
- **Best UX**: Push Protocol (1 day)
