'use client';


import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { toast } from 'react-hot-toast';
import { useAuthModal } from '@/hooks/useAuthModal';


export const AuthModal = () => {
  const supabaseClient = useSupabaseClient();
  const { onClose, isOpen } = useAuthModal();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in!');
      onClose();
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    // Store profile in users table
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: data.user?.id,
        full_name: fullName,
        avatar_url: avatarUrl,
      }),
    });
    setLoading(false);
    toast.success('Account created! Check your email for confirmation.');
    onClose();
  };

  return (
    <Modal
      title={tab === 'login' ? 'Login' : 'Sign Up'}
      description={tab === 'login' ? 'Login to your account' : 'Create a new account'}
      isOpen={isOpen}
      onChange={onClose}
    >
      <div className="flex gap-x-4 mb-4">
        <Button onClick={() => setTab('login')} disabled={tab === 'login'}>Login</Button>
        <Button onClick={() => setTab('signup')} disabled={tab === 'signup'}>Sign Up</Button>
      </div>
      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-y-4">
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>Login</Button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="flex flex-col gap-y-4">
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            id="fullName"
            placeholder="Full Name (optional)"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            disabled={loading}
          />
          <Input
            id="avatarUrl"
            placeholder="Avatar URL (optional)"
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>Sign Up</Button>
        </form>
      )}
    </Modal>
  );
};
