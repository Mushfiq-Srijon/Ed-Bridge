import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MessagingModal from '../components/Marketplace/MessagingModal';
import '../styles/MessagesPage.css';

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConversations = useCallback(async () => {
    try {
      setError('');
      const data = await listingsAPI.getConversations();
      setConversations(data);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const openConversation = (conversation) => {
    const isSender = conversation.senderId === user.id;
    setSelectedConversation({
      id: conversation.listingId,
      title: conversation.listingTitle,
      seller: {
        id: isSender ? conversation.receiverId : conversation.senderId,
        name: isSender ? conversation.receiverName : conversation.senderName
      },
      recipientId: isSender ? conversation.receiverId : conversation.senderId,
      recipientName: isSender ? conversation.receiverName : conversation.senderName
    });
  };

  return (
    <main className="messages-page">
      <div className="messages-page-container">
        <button className="messages-back" onClick={() => navigate('/marketplace')}>
          ← Back to Marketplace
        </button>
        <div className="messages-page-header">
          <div>
            <p className="messages-eyebrow">Marketplace</p>
            <h1>Messages</h1>
            <p>Keep track of conversations about your listings and purchases.</p>
          </div>
        </div>

        {loading ? (
          <div className="messages-state">Loading messages...</div>
        ) : error ? (
          <div className="messages-state messages-error">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="messages-state">
            <h2>No messages yet</h2>
            <p>When someone contacts you about a listing, the conversation will appear here.</p>
          </div>
        ) : (
          <div className="conversation-list">
            {conversations.map((conversation) => {
              const isSender = conversation.senderId === user.id;
              const otherName = isSender ? conversation.receiverName : conversation.senderName;
              return (
                <button
                  type="button"
                  className="conversation-card"
                  key={`${conversation.listingId}-${isSender ? conversation.receiverId : conversation.senderId}`}
                  onClick={() => openConversation(conversation)}
                >
                  <span className="conversation-avatar">{otherName?.charAt(0) || '?'}</span>
                  <span className="conversation-details">
                    <strong>{otherName}</strong>
                    <span>{conversation.listingTitle}</span>
                    <small>{conversation.content}</small>
                  </span>
                  <span className="conversation-time">
                    {new Date(conversation.createdAt).toLocaleDateString()}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedConversation && (
        <MessagingModal
          listing={selectedConversation}
          onClose={() => setSelectedConversation(null)}
          currentUserId={user.id}
          recipientId={selectedConversation.recipientId}
          recipientName={selectedConversation.recipientName}
        />
      )}
    </main>
  );
}
