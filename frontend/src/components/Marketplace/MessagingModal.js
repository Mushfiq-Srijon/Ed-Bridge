import React, { useCallback, useState, useEffect } from 'react';
import { listingsAPI } from '../../services/api';
import '../../styles/MessagingModal.css';

export default function MessagingModal({
  listing,
  onClose,
  currentUserId,
  recipientId = listing.seller.id,
  recipientName = listing.seller.name
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listingsAPI.getMessages(listing.id);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [listing.id]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      setSending(true);
      await listingsAPI.sendMessage(listing.id, {
        content: newMessage,
        receiverId: recipientId
      });

      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messaging-modal-overlay" onClick={onClose}>
      <div className="messaging-modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="messaging-header">
          <div>
            <h2>💬 Message with {recipientName}</h2>
            <p>{listing.title}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="messages-container">
          {loading && messages.length === 0 ? (
            <div className="messages-loading">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="messages-list">
              {[...messages].reverse().map((msg) => (
                <div
                  key={msg.id}
                  className={`message-item ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
                >
                  <div className="message-avatar">
                    {msg.senderName?.charAt(0) || '?'}
                  </div>

                  <div className="message-content">
                    <div className="message-bubble">
                      {msg.content}
                    </div>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="message-input"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="send-btn"
          >
            {sending ? '⏳' : '📤'} Send
          </button>
        </form>

      </div>
    </div>
  );
}