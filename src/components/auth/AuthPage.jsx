import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';

export function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'

  return (
    <>
      {mode === 'login' && (
        <Login
          onToggleMode={() => setMode('signup')}
          onForgotPassword={() => setMode('forgot')}
        />
      )}
      {mode === 'signup' && (
        <Signup onToggleMode={() => setMode('login')} />
      )}
      {mode === 'forgot' && (
        <ForgotPassword onBack={() => setMode('login')} />
      )}
    </>
  );
}

export default AuthPage;
