import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, firestore } from '../services/firebase';
import { signIn, signUp, signOut } from '../services/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import UserReputation from '../components/UserReputation';

function Profile() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState(null);
  const [emailNotifications, setEmailNotifications] = useState({
    newDonations: false,
    reservations: false,
    expirations: false
  });
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setEmailNotifications(data.emailNotifications || {
            newDonations: false,
            reservations: false,
            expirations: false
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (error) {
      console.error("Error signing in:", error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signUp(email, password);
      const user = userCredential.user;
      
      // Initialize user profile with reputation fields
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        averageRating: 0,
        reputation: 100, // Starting reputation
        totalRatings: 0,
        successfulDonations: 0,
        successfulReservations: 0,
        emailNotifications: {
          newDonations: false,
          reservations: false,
          expirations: false
        }
      });
    } catch (error) {
      console.error("Error signing up:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const handleNotificationChange = async (event) => {
    const { name, checked } = event.target;
    const newEmailNotifications = { ...emailNotifications, [name]: checked };
    setEmailNotifications(newEmailNotifications);

    try {
      await updateDoc(doc(firestore, 'users', user.uid), {
        emailNotifications: newEmailNotifications
      });
    } catch (error) {
      console.error("Error updating email notifications:", error);
    }
  };

  if (user && userData) {
    return (
      <div>
        <h2>{t('profile.title')}</h2>
        <p>{t('profile.welcome')}, {user.email}!</p>
        <UserReputation 
          reputation={userData.reputation} 
          averageRating={userData.averageRating} 
          totalRatings={userData.totalRatings}
        />
        <h3>{t('profile.emailNotifications')}</h3>
        <div>
          <label>
            <input
              type="checkbox"
              name="newDonations"
              checked={emailNotifications.newDonations}
              onChange={handleNotificationChange}
            />
            {t('profile.notifyNewDonations')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="reservations"
              checked={emailNotifications.reservations}
              onChange={handleNotificationChange}
            />
            {t('profile.notifyReservations')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="expirations"
              checked={emailNotifications.expirations}
              onChange={handleNotificationChange}
            />
            {t('profile.notifyExpirations')}
          </label>
        </div>
        <button onClick={handleLogout}>{t('profile.logout')}</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{t('profile.loginSignup')}</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder={t('profile.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('profile.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{t('profile.login')}</button>
      </form>
      <button onClick={handleSignUp}>{t('profile.signup')}</button>
    </div>
  );
}

export default Profile;
