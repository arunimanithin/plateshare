import { useState, useEffect, useCallback } from 'react';
import { User, Page } from './types';
import { initializeDB } from './api';
import Navbar from './components/Navbar';
import HeroPage from './components/HeroPage';
import BrowseFood from './components/BrowseFood';
import DonorDashboard from './components/DonorDashboard';
import PostFood from './components/PostFood';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import NgoDashboard from './components/NgoDashboard';

const SESSION_KEY = 'plateshare_session';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [modalMode, setModalMode] = useState<'login' | 'signup' | null>(null);

  // Initialize database on first load
  useEffect(() => {
    initializeDB();
    // Restore session
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setModalMode(null);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    setCurrentPage('home');
  }, []);

  const handleNavigate = useCallback((page: Page) => {
    // Check auth for protected pages
    if ((page === 'my-listings' || page === 'post-food' || page === 'admin' || page === 'my-claims') && !currentUser) {
      setModalMode('login');
      return;
    }
    if (page === 'post-food' && currentUser && currentUser.role === 'recipient') {
      return;
    }
    if (page === 'admin' && currentUser && currentUser.role !== 'admin') {
      return;
    }
    if (page === 'my-claims' && currentUser && currentUser.role !== 'recipient') {
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentUser]);

  const handleFindFood = useCallback(() => {
    setCurrentPage('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDonateFood = useCallback(() => {
    if (!currentUser) {
      setModalMode('login');
      return;
    }
    if (currentUser.role === 'donor' || currentUser.role === 'admin') {
      setCurrentPage('post-food');
    } else {
      setModalMode('login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentUser]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HeroPage onFindFood={handleFindFood} onDonateFood={handleDonateFood} />;
      case 'browse':
        // Recipient users get the NgoDashboard with browse tab
        if (currentUser && currentUser.role === 'recipient') {
          return (
            <NgoDashboard
              currentUser={currentUser}
              initialTab="browse"
            />
          );
        }
        return (
          <BrowseFood
            currentUser={currentUser}
            onLoginRequired={() => setModalMode('login')}
          />
        );
      case 'my-claims':
        if (!currentUser || currentUser.role !== 'recipient') return null;
        return (
          <NgoDashboard
            currentUser={currentUser}
            initialTab="claims"
          />
        );
      case 'my-listings':
        if (!currentUser) return null;
        return (
          <DonorDashboard
            currentUser={currentUser}
            onPostFood={() => handleNavigate('post-food')}
          />
        );
      case 'post-food':
        if (!currentUser) return null;
        return (
          <PostFood
            currentUser={currentUser}
            onSuccess={() => {
              setCurrentPage('my-listings');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoBack={() => {
              setCurrentPage('my-listings');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      case 'admin':
        if (!currentUser || currentUser.role !== 'admin') return null;
        return <AdminDashboard currentUser={currentUser} />;
      default:
        return <HeroPage onFindFood={handleFindFood} onDonateFood={handleDonateFood} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLoginClick={() => setModalMode('login')}
        onSignupClick={() => setModalMode('signup')}
        onLogout={handleLogout}
      />

      <main>{renderPage()}</main>

      {/* Login/Signup Modal */}
      {modalMode && (
        <LoginModal
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onSuccess={handleLogin}
          onToggleMode={() => setModalMode(prev => (prev === 'login' ? 'signup' : 'login'))}
        />
      )}
    </div>
  );
}

export default App;
