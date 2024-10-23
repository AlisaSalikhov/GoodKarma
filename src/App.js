import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import './App.css';

import Home from './pages/Home';
import Donate from './pages/Donate';
import Find from './pages/Find';
import Profile from './pages/Profile';
import VoiceInteraction from './components/VoiceInteraction';
import Notifications from './components/Notifications';
import AdminDashboard from './components/AdminDashboard';
import LanguageSelector from './components/LanguageSelector';
import { auth, firestore } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        setIsAdmin(userDoc.data()?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const ProtectedRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        isAdmin ? <Component {...props} /> : <Redirect to="/" />
      }
    />
  );

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">{t('nav.home')}</Link></li>
            <li><Link to="/donate">{t('nav.donate')}</Link></li>
            <li><Link to="/find">{t('nav.find')}</Link></li>
            <li><Link to="/profile">{t('nav.profile')}</Link></li>
            {isAdmin && <li><Link to="/admin">{t('nav.admin')}</Link></li>}
          </ul>
        </nav>

        <LanguageSelector />
        <VoiceInteraction />
        <Notifications />

        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/donate" component={Donate} />
          <Route path="/find" component={Find} />
          <Route path="/profile" component={Profile} />
          <ProtectedRoute path="/admin" component={AdminDashboard} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
