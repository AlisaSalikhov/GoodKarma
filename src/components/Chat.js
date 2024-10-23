import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../services/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const Chat = ({ donationId, donorId, recipientId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (donationId && donorId && recipientId) {
      const q = query(
        collection(firestore, 'chats'),
        where('donationId', '==', donationId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(newMessages);
      });

      return () => unsubscribe();
    }
  }, [donationId, donorId, recipientId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    try {
      await addDoc(collection(firestore, 'chats'), {
        donationId,
        donorId,
        recipientId,
        senderId: user.uid,
        message: newMessage,
        timestamp: new Date()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user || (user.uid !== donorId && user.uid !== recipientId)) {
    return <p>You don't have permission to view this chat.</p>;
  }

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.senderId === user.uid ? 'sent' : 'received'}`}>
            <p>{msg.message}</p>
            <small>{msg.timestamp.toDate().toLocaleString()}</small>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
