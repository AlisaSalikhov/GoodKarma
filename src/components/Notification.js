import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '../services/firebase';
import { auth, firestore } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

const Notifications = () => {
  const [notification, setNotification] = useState({ title: '', body: '' });

  useEffect(() => {
    requestPermissionAndSaveToken();
    const unsubscribe = auth.onAuthStateChanged(handleAuthStateChanged);
    return () => unsubscribe();
  }, []);

  const handleAuthStateChanged = async (user) => {
    if (user) {
      const token = await requestNotificationPermission();
      if (token) {
        await saveTokenToFirestore(user.uid, token);
      }
    }
  };

  const requestPermissionAndSaveToken = async () => {
    const token = await requestNotificationPermission();
    if (token && auth.currentUser) {
      await saveTokenToFirestore(auth.currentUser.uid, token);
    }
  };

  const saveTokenToFirestore = async (userId, token) => {
    const userRef = doc(firestore, 'users', userId);
    await setDoc(userRef, { fcmToken: token }, { merge: true });
  };

  useEffect(() => {
    const unsubscribe = onMessageListener().then((payload) => {
      setNotification({
        title: payload.notification.title,
        body: payload.notification.body
      });
    });

    return () => unsubscribe;
  }, []);

  return (
    <div>
      {notification?.title && (
        <div>
          <h2>{notification.title}</h2>
          <p>{notification.body}</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
