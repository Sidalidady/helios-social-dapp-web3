# 💬 Blockchain Chat System Implementation Guide

## 🎯 Overview

Add a real-time, decentralized chat system to your Stellari DApp where users can communicate on-chain.

---

## 🏗️ Architecture Options

### Option 1: Fully On-Chain Chat (Simple but Expensive)
**Pros:**
- ✅ Fully decentralized
- ✅ Permanent message history
- ✅ No external dependencies

**Cons:**
- ❌ Expensive (gas costs per message)
- ❌ Slow (blockchain confirmation time)
- ❌ Limited message size

### Option 2: Hybrid (IPFS + Blockchain) ⭐ RECOMMENDED
**Pros:**
- ✅ Cost-effective (only hash on-chain)
- ✅ Large messages supported
- ✅ Fast message delivery
- ✅ Decentralized storage

**Cons:**
- ⚠️ Requires IPFS integration
- ⚠️ Slightly more complex

### Option 3: Event-Based Chat (Best Performance)
**Pros:**
- ✅ Very cheap (events are cheaper than storage)
- ✅ Fast
- ✅ Real-time updates
- ✅ Good for public chat

**Cons:**
- ⚠️ Messages not permanently stored on-chain
- ⚠️ Need to index events

---

## 🚀 Implementation: Hybrid Chat System

I'll show you the **recommended hybrid approach** using IPFS for message content and blockchain for indexing.

---

## 📜 Step 1: Update Smart Contract

Add these functions to your `SocialFeed.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Add to your existing contract

// ============================================
// CHAT SYSTEM
// ============================================

struct ChatMessage {
    uint256 id;
    address sender;
    string ipfsHash;      // Message content on IPFS
    uint256 timestamp;
    bool isDeleted;
}

struct ChatRoom {
    uint256 id;
    string name;
    address creator;
    uint256 messageCount;
    bool isPublic;
    uint256 createdAt;
}

// Storage
mapping(uint256 => ChatRoom) public chatRooms;
mapping(uint256 => ChatMessage[]) public roomMessages;
mapping(uint256 => mapping(address => bool)) public roomMembers;
uint256 public totalChatRooms;

// Events
event ChatRoomCreated(uint256 indexed roomId, string name, address indexed creator, bool isPublic);
event MessageSent(uint256 indexed roomId, uint256 indexed messageId, address indexed sender, string ipfsHash, uint256 timestamp);
event MessageDeleted(uint256 indexed roomId, uint256 indexed messageId, address indexed sender);
event UserJoinedRoom(uint256 indexed roomId, address indexed user);
event UserLeftRoom(uint256 indexed roomId, address indexed user);

// ============================================
// CHAT FUNCTIONS
// ============================================

/**
 * @dev Create a new chat room
 * @param _name Room name
 * @param _isPublic True for public room, false for private
 */
function createChatRoom(string memory _name, bool _isPublic) external returns (uint256) {
    require(bytes(_name).length > 0, "Room name required");
    require(bytes(_name).length <= 50, "Room name too long");
    
    totalChatRooms++;
    uint256 roomId = totalChatRooms;
    
    chatRooms[roomId] = ChatRoom({
        id: roomId,
        name: _name,
        creator: msg.sender,
        messageCount: 0,
        isPublic: _isPublic,
        createdAt: block.timestamp
    });
    
    // Creator automatically joins
    roomMembers[roomId][msg.sender] = true;
    
    emit ChatRoomCreated(roomId, _name, msg.sender, _isPublic);
    emit UserJoinedRoom(roomId, msg.sender);
    
    return roomId;
}

/**
 * @dev Send a message to a chat room
 * @param _roomId Chat room ID
 * @param _ipfsHash IPFS hash of message content
 */
function sendMessage(uint256 _roomId, string memory _ipfsHash) external {
    require(_roomId > 0 && _roomId <= totalChatRooms, "Invalid room");
    require(bytes(_ipfsHash).length > 0, "Message required");
    
    ChatRoom storage room = chatRooms[_roomId];
    
    // Check access
    if (!room.isPublic) {
        require(roomMembers[_roomId][msg.sender], "Not a member");
    }
    
    room.messageCount++;
    uint256 messageId = room.messageCount;
    
    ChatMessage memory newMessage = ChatMessage({
        id: messageId,
        sender: msg.sender,
        ipfsHash: _ipfsHash,
        timestamp: block.timestamp,
        isDeleted: false
    });
    
    roomMessages[_roomId].push(newMessage);
    
    emit MessageSent(_roomId, messageId, msg.sender, _ipfsHash, block.timestamp);
}

/**
 * @dev Join a public chat room
 * @param _roomId Chat room ID
 */
function joinChatRoom(uint256 _roomId) external {
    require(_roomId > 0 && _roomId <= totalChatRooms, "Invalid room");
    ChatRoom storage room = chatRooms[_roomId];
    require(room.isPublic, "Room is private");
    require(!roomMembers[_roomId][msg.sender], "Already a member");
    
    roomMembers[_roomId][msg.sender] = true;
    emit UserJoinedRoom(_roomId, msg.sender);
}

/**
 * @dev Leave a chat room
 * @param _roomId Chat room ID
 */
function leaveChatRoom(uint256 _roomId) external {
    require(_roomId > 0 && _roomId <= totalChatRooms, "Invalid room");
    require(roomMembers[_roomId][msg.sender], "Not a member");
    
    roomMembers[_roomId][msg.sender] = false;
    emit UserLeftRoom(_roomId, msg.sender);
}

/**
 * @dev Delete own message
 * @param _roomId Chat room ID
 * @param _messageId Message ID
 */
function deleteMessage(uint256 _roomId, uint256 _messageId) external {
    require(_roomId > 0 && _roomId <= totalChatRooms, "Invalid room");
    require(_messageId > 0 && _messageId <= chatRooms[_roomId].messageCount, "Invalid message");
    
    ChatMessage storage message = roomMessages[_roomId][_messageId - 1];
    require(message.sender == msg.sender, "Not your message");
    require(!message.isDeleted, "Already deleted");
    
    message.isDeleted = true;
    emit MessageDeleted(_roomId, _messageId, msg.sender);
}

/**
 * @dev Get chat room info
 * @param _roomId Chat room ID
 */
function getChatRoom(uint256 _roomId) external view returns (ChatRoom memory) {
    require(_roomId > 0 && _roomId <= totalChatRooms, "Invalid room");
    return chatRooms[_roomId];
}

/**
 * @dev Get recent messages from a room
 * @param _roomId Chat room ID
 * @param _offset Starting index
 * @param _limit Number of messages
 */
function getRoomMessages(uint256 _roomId, uint256 _offset, uint256 _limit) 
    external 
    view 
    returns (ChatMessage[] memory) 
{
    require(_roomId > 0 && _roomId <= totalChatRooms, "Invalid room");
    
    ChatMessage[] storage messages = roomMessages[_roomId];
    uint256 total = messages.length;
    
    if (_offset >= total) {
        return new ChatMessage[](0);
    }
    
    uint256 end = _offset + _limit;
    if (end > total) {
        end = total;
    }
    
    uint256 resultLength = end - _offset;
    ChatMessage[] memory result = new ChatMessage[](resultLength);
    
    for (uint256 i = 0; i < resultLength; i++) {
        result[i] = messages[_offset + i];
    }
    
    return result;
}

/**
 * @dev Check if user is a member of a room
 * @param _roomId Chat room ID
 * @param _user User address
 */
function isRoomMember(uint256 _roomId, address _user) external view returns (bool) {
    return roomMembers[_roomId][_user];
}

/**
 * @dev Get all public chat rooms
 */
function getPublicChatRooms() external view returns (ChatRoom[] memory) {
    uint256 publicCount = 0;
    
    // Count public rooms
    for (uint256 i = 1; i <= totalChatRooms; i++) {
        if (chatRooms[i].isPublic) {
            publicCount++;
        }
    }
    
    ChatRoom[] memory result = new ChatRoom[](publicCount);
    uint256 index = 0;
    
    // Fill array
    for (uint256 i = 1; i <= totalChatRooms; i++) {
        if (chatRooms[i].isPublic) {
            result[index] = chatRooms[i];
            index++;
        }
    }
    
    return result;
}
```

---

## 🎨 Step 2: Create Chat Components

### ChatRoom.js

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useContractWrite, useContractRead, useWatchContractEvent } from 'wagmi';
import { Upload, Send, Users, Settings, X } from 'lucide-react';
import './ChatRoom.css';

function ChatRoom({ roomId, roomName, onClose }) {
  const { address } = useAccount();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Contract configuration
  const contractConfig = {
    address: process.env.REACT_APP_CONTRACT_ADDRESS,
    abi: YOUR_CONTRACT_ABI,
  };

  // Load messages
  const { data: messagesData, refetch } = useContractRead({
    ...contractConfig,
    functionName: 'getRoomMessages',
    args: [roomId, 0, 50],
  });

  // Send message function
  const { writeAsync: sendMessageWrite } = useContractWrite({
    ...contractConfig,
    functionName: 'sendMessage',
  });

  // Listen for new messages
  useWatchContractEvent({
    ...contractConfig,
    eventName: 'MessageSent',
    listener: (logs) => {
      logs.forEach(log => {
        if (log.args.roomId === roomId) {
          refetch();
        }
      });
    },
  });

  // Load messages from IPFS
  useEffect(() => {
    if (messagesData) {
      loadMessagesFromIPFS(messagesData);
    }
  }, [messagesData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessagesFromIPFS = async (messageHashes) => {
    const loadedMessages = await Promise.all(
      messageHashes.map(async (msg) => {
        if (msg.isDeleted) {
          return {
            ...msg,
            content: '[Message deleted]',
          };
        }
        
        try {
          // Load from IPFS
          const response = await fetch(`https://ipfs.io/ipfs/${msg.ipfsHash}`);
          const content = await response.text();
          return {
            ...msg,
            content,
          };
        } catch (error) {
          return {
            ...msg,
            content: '[Failed to load]',
          };
        }
      })
    );
    setMessages(loadedMessages);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsLoading(true);
    try {
      // Upload message to IPFS
      const ipfsHash = await uploadToIPFS(newMessage);
      
      // Send to blockchain
      await sendMessageWrite({
        args: [roomId, ipfsHash],
      });
      
      setNewMessage('');
      refetch();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadToIPFS = async (content) => {
    // Simple IPFS upload (you can use Pinata, Web3.Storage, etc.)
    const blob = new Blob([content], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob);
    
    // Using public IPFS gateway (replace with your service)
    const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    return data.Hash;
  };

  const formatTime = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleTimeString();
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="chat-room">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <Users size={20} />
          <h3>{roomName}</h3>
        </div>
        <div className="chat-header-right">
          <button className="btn-icon" title="Settings">
            <Settings size={20} />
          </button>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.sender.toLowerCase() === address?.toLowerCase() ? 'own-message' : ''
            }`}
          >
            <div className="message-header">
              <span className="message-sender">
                {msg.sender.toLowerCase() === address?.toLowerCase()
                  ? 'You'
                  : formatAddress(msg.sender)}
              </span>
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading}
        />
        <button
          className="btn-send"
          onClick={handleSendMessage}
          disabled={isLoading || !newMessage.trim()}
        >
          {isLoading ? <Upload size={20} className="spinning" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;
```

### ChatRoom.css

```css
.chat-room {
  display: flex;
  flex-direction: column;
  height: 600px;
  background: rgba(15, 23, 42, 0.95);
  border: 2px solid rgba(255, 152, 0, 0.4);
  border-radius: 16px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 111, 0, 0.15) 100%);
  border-bottom: 2px solid rgba(255, 152, 0, 0.3);
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-header-left h3 {
  margin: 0;
  color: #ff9800;
  font-size: 1.25rem;
}

.chat-header-right {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: rgba(255, 152, 0, 0.2);
  border: 1px solid rgba(255, 152, 0, 0.4);
  color: #ff9800;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 152, 0, 0.3);
  transform: scale(1.05);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  padding: 0.75rem 1rem;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 12px;
  animation: slideIn 0.3s ease-out;
}

.chat-message.own-message {
  align-self: flex-end;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 111, 0, 0.2) 100%);
  border-color: rgba(255, 152, 0, 0.5);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.message-sender {
  color: #ff9800;
  font-weight: 600;
}

.message-time {
  color: #94a3b8;
  font-size: 0.75rem;
}

.message-content {
  color: #f1f5f9;
  line-height: 1.5;
  word-wrap: break-word;
}

.chat-input {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(30, 41, 59, 0.95);
  border-top: 2px solid rgba(255, 152, 0, 0.3);
}

.chat-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 152, 0, 0.1);
  border: 2px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.chat-input input:focus {
  border-color: rgba(255, 152, 0, 0.6);
  background: rgba(255, 152, 0, 0.15);
}

.btn-send {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ff9800 0%, #ff6f00 100%);
  border: 2px solid rgba(255, 152, 0, 0.6);
  border-radius: 8px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.5);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(255, 152, 0, 0.1);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(255, 152, 0, 0.4);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 152, 0, 0.6);
}
```

### ChatRoomList.js

```javascript
import React, { useState } from 'react';
import { useContractRead, useContractWrite } from 'wagmi';
import { MessageCircle, Plus, Users, Lock, Globe } from 'lucide-react';
import ChatRoom from './ChatRoom';
import './ChatRoomList.css';

function ChatRoomList() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const contractConfig = {
    address: process.env.REACT_APP_CONTRACT_ADDRESS,
    abi: YOUR_CONTRACT_ABI,
  };

  // Load public rooms
  const { data: rooms, refetch } = useContractRead({
    ...contractConfig,
    functionName: 'getPublicChatRooms',
  });

  // Create room function
  const { writeAsync: createRoomWrite } = useContractWrite({
    ...contractConfig,
    functionName: 'createChatRoom',
  });

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    try {
      await createRoomWrite({
        args: [newRoomName, isPublic],
      });
      
      setNewRoomName('');
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  };

  if (selectedRoom) {
    return (
      <ChatRoom
        roomId={selectedRoom.id}
        roomName={selectedRoom.name}
        onClose={() => setSelectedRoom(null)}
      />
    );
  }

  return (
    <div className="chat-room-list">
      <div className="chat-list-header">
        <h2>
          <MessageCircle size={24} />
          Chat Rooms
        </h2>
        <button className="btn-create" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          Create Room
        </button>
      </div>

      <div className="room-list">
        {rooms?.map((room) => (
          <div
            key={room.id}
            className="room-item"
            onClick={() => setSelectedRoom(room)}
          >
            <div className="room-icon">
              {room.isPublic ? <Globe size={24} /> : <Lock size={24} />}
            </div>
            <div className="room-info">
              <h3>{room.name}</h3>
              <p>
                <Users size={14} />
                {room.messageCount} messages
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create Chat Room</h3>
            <input
              type="text"
              placeholder="Room name..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              maxLength={50}
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Public room
            </label>
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateRoom}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoomList;
```

---

## 🎯 Step 3: Integration

Add chat to your main App.js:

```javascript
import ChatRoomList from './components/ChatRoomList';

// In your sidebar or navigation
<button onClick={() => setShowChat(true)}>
  <MessageCircle size={20} />
  Chat
</button>

{showChat && <ChatRoomList />}
```

---

## 💡 Advanced Features

### 1. Direct Messages (DM)
```solidity
mapping(bytes32 => ChatMessage[]) private directMessages;

function sendDirectMessage(address _recipient, string memory _ipfsHash) external {
    bytes32 chatId = getChatId(msg.sender, _recipient);
    // Store message
}

function getChatId(address _user1, address _user2) private pure returns (bytes32) {
    return _user1 < _user2 
        ? keccak256(abi.encodePacked(_user1, _user2))
        : keccak256(abi.encodePacked(_user2, _user1));
}
```

### 2. Message Reactions
```solidity
mapping(uint256 => mapping(uint256 => mapping(address => string))) public messageReactions;

function reactToMessage(uint256 _roomId, uint256 _messageId, string memory _emoji) external {
    messageReactions[_roomId][_messageId][msg.sender] = _emoji;
    emit MessageReacted(_roomId, _messageId, msg.sender, _emoji);
}
```

### 3. Typing Indicators
Use WebSocket or polling to show "User is typing..."

### 4. Message Encryption
Encrypt messages before uploading to IPFS using recipient's public key.

---

## 📊 Cost Estimation

### Gas Costs (Approximate on Helios):
- Create room: ~100,000 gas
- Send message: ~80,000 gas
- Join room: ~50,000 gas
- Delete message: ~30,000 gas

### IPFS Costs:
- Free with public gateways
- ~$0.01/GB with Pinata/Web3.Storage

---

## 🔒 Security Considerations

1. **Rate Limiting** - Prevent spam
2. **Message Validation** - Check content length
3. **Access Control** - Verify room membership
4. **Encryption** - For private messages
5. **Moderation** - Room admin controls

---

## 🚀 Deployment Steps

1. **Update Contract**
   ```bash
   npm run compile
   npm run deploy
   ```

2. **Update Frontend**
   - Add chat components
   - Update contract ABI
   - Configure IPFS

3. **Test**
   - Create rooms
   - Send messages
   - Test real-time updates

---

## 📚 Resources

- **IPFS:** https://ipfs.io
- **Pinata:** https://pinata.cloud
- **Web3.Storage:** https://web3.storage
- **Wagmi Docs:** https://wagmi.sh

---

## 🎉 Result

You'll have a fully functional, decentralized chat system with:
- ✅ Multiple chat rooms
- ✅ Real-time messaging
- ✅ IPFS storage
- ✅ Orange-themed UI
- ✅ Blockchain security
- ✅ Low gas costs

**Happy Chatting! 💬🚀**
