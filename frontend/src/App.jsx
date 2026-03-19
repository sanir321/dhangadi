import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GamePage from './pages/GamePage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import TrackOrderPage from './pages/TrackOrderPage';
import FAQPage from './pages/FAQPage';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import { DependencyProvider } from './DependencyContext';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NanoBanner from './components/NanoBanner';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './lib/supabase';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && (location.pathname === '/' || location.pathname === '/admin/login')) {
        if (session.user.email === 'comradeskhatri@gmail.com') {
          navigate('/admin/dashboard', { replace: true });
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (location.pathname === '/' || location.pathname === '/admin/login') {
          if (session.user.email === 'comradeskhatri@gmail.com') {
            navigate('/admin/dashboard', { replace: true });
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return null;
};


const queryClient = new QueryClient();

function App() {
  return (
    <DependencyProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthHandler />
          <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="/checkout/:gameId/:pkgId" element={<CheckoutPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/track" element={<TrackOrderPage />} />
            <Route path="/faq" element={<FAQPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#262626',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }} />
        </div>
      </Router>
      </QueryClientProvider>
    </DependencyProvider>
  );
}

export default App;
