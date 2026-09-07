import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AmbientAudioPlayer from '../components/AmbientAudioPlayer';
import TicketModal from '../components/TicketModal';
import AuthModal from '../components/AuthModal';
import { removeCookie } from '../utils/cookies';

export default function UserLayout() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load stored user session if available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    if (userData?.role === 'admin') {
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    removeCookie('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-[#0C0D10] text-[#F5F5F0] overflow-x-hidden font-poppins">
      
      {/* Ambient Audio Engine */}
      <AmbientAudioPlayer isPlaying={audioPlaying} />

      {/* Sticky Glassmorphic Navbar */}
      <Navbar 
        onOpenShop={() => setIsTicketModalOpen(true)}
        onOpenSignup={() => setIsAuthModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        user={user}
        onLogout={handleLogout}
        onNavigateToAdmin={() => navigate('/admin')}
      />

      {/* Dynamic Outlet for Public Pages */}
      <main className="w-full">
        <Outlet context={{ 
          onOpenShop: () => setIsTicketModalOpen(true), 
          onOpenSignup: () => setIsAuthModalOpen(true),
          user
        }} />
      </main>

      {/* Footer */}
      <Footer onOpenTickets={() => setIsTicketModalOpen(true)} />

      {/* Appointment & Order Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
