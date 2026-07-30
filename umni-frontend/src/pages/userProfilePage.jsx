import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountService } from '../service/accountService';
import '../css/ProfilePage.css';

const UserProfilePage = () => {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setError('');

    if (confirmation !== 'DELETE') {
      setError('Type DELETE exactly to confirm.');
      return;
    }
    if (!password) {
      setError('Enter your current password.');
      return;
    }

    setDeleting(true);
    try {
      await accountService.deleteAccount(password);
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (requestError) {
      setError(requestError.message || 'Could not delete your account. Nothing was changed.');
      setDeleting(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <button className="profile-back" onClick={() => navigate('/home')}>
          &larr; Back to UmNi
        </button>
        <h1>Account settings</h1>
        <p>Your account controls your chats, vision library, and notes vault.</p>

        <section className="danger-zone">
          <h2>Delete account</h2>
          <p>
            This permanently deletes your account, conversations, messages,
            generated images, original drawings, and uploaded notes. This cannot be undone.
          </p>

          <form onSubmit={handleDeleteAccount}>
            <label htmlFor="current-password">Current password</label>
            <input
              id="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={deleting}
            />

            <label htmlFor="delete-confirmation">Type DELETE to confirm</label>
            <input
              id="delete-confirmation"
              type="text"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={deleting}
            />

            {error && <p className="profile-error">{error}</p>}

            <button
              className="delete-account-button"
              type="submit"
              disabled={deleting || confirmation !== 'DELETE' || !password}
            >
              {deleting ? 'Deleting account...' : 'Permanently delete account'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default UserProfilePage;
