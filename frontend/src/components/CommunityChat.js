import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MessageCircle, Send, X, User, Loader2 } from 'lucide-react';
import { uploadToIPFS, getFromIPFS } from '../utils/ipfs';
import { formatTimestamp } from '../utils/formatters';
import contractData from '../contracts/SocialFeed.json';
import './CommunityChat.css';

function CommunityChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { address, isConnected } = useAccount();
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // Get user's profile
  const { data: profileData } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getUserProfile',
    args: [address],
    enabled: !!address && isConnected,
  });

  useEffect(() => {
    // Load user profile
    const loadProfile = async () => {
      if (profileData && profileData[0] && profileData[0].length > 0) {
        const username = profileData[0];
        const ipfsHash = profileData[1];
        let profileImage = '';

        if (ipfsHash) {
          try {
            const data = await getFromIPFS(ipfsHash);
            if (data && data.image) {
              profileImage = data.image;
            }
          } catch (error) {
            console.error('Error loading profile:', error);
          }
        }

        setUserProfile({ username, profileImage });
        console.log('Profile loaded for chat:', username);
      } else {
        console.log('No profile found for chat');
      }
    };

    loadProfile();
  }, [profileData]);

  useEffect(() => {
    // Load messages from localStorage
    const loadMessages = () => {
      const stored = localStorage.getItem('community_chat_messages');
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    };

    loadMessages();

    // Poll for new messages every 2 seconds
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !userProfile || !address) return;

    setIsLoading(true);
    try {
      // Upload message to IPFS
      const messageData = {
        content: newMessage.trim(),
        username: userProfile.username,
        profileImage: userProfile.profileImage,
        timestamp: Date.now(),
      };
      const ipfsHash = await uploadToIPFS(JSON.stringify(messageData));
      console.log('Message uploaded to IPFS:', ipfsHash);

      // Send blockchain transaction
      writeContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'sendChatMessage',
        args: [ipfsHash],
      }, {
        onSuccess: () => {
          console.log('Chat message transaction sent');
          
          // Store locally for immediate display
          const message = {
            id: Date.now(),
            author: address,
            username: userProfile.username,
            profileImage: userProfile.profileImage,
            content: newMessage.trim(),
            timestamp: Date.now(),
          };

          const updatedMessages = [...messages, message];
          setMessages(updatedMessages);
          localStorage.setItem('community_chat_messages', JSON.stringify(updatedMessages));
          
          setNewMessage('');
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('Error sending message:', error);
          alert('Failed to send message: ' + error.message);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message');
      setIsLoading(false);
    }
  };

  const hasProfile = userProfile && userProfile.username && userProfile.username.length > 0;
  
  console.log('Chat - Has profile:', hasProfile, 'User profile:', userProfile);

  if (!isConnected) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Community Chat"
      >
        <MessageCircle size={24} />
        {messages.length > 0 && (
          <span className="chat-badge">{messages.length}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="community-chat">
          <div className="chat-header">
            <div className="chat-header-title">
              <MessageCircle size={20} />
              <h3>Community Chat</h3>
            </div>
            <button 
              className="btn-close-chat"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <MessageCircle size={48} />
                <p>No messages yet</p>
                <span>Be the first to say hello!</span>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`chat-message ${msg.author.toLowerCase() === address?.toLowerCase() ? 'own-message' : ''}`}
                >
                  <div className="message-avatar">
                    {msg.profileImage ? (
                      <img src={msg.profileImage} alt={msg.username} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-username">{msg.username}</span>
                      <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                    <p className="message-text">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {hasProfile ? (
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                maxLength={500}
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="btn-send-message"
              >
                {isLoading ? (
                  <Loader2 size={20} className="spinning" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
          ) : (
            <div className="chat-no-profile">
              <p>Create a profile to join the chat</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default CommunityChat;
