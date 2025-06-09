import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './AuthPages.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Por favor, digite seu e-mail.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Morada Digital informa: Verifique seu e-mail! Um link para redefinição de senha foi enviado.");
    } catch (error) {
      console.error("Erro ao enviar e-mail de redefinição:", error.code);
      alert("Morada Digital informa: Não foi possível enviar o e-mail.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Recuperar Senha</h2>
        <p style={{textAlign: 'center', color: '#666', marginTop: '-15px', marginBottom: '30px'}}>
          Enviaremos um link para seu e-mail para você criar uma nova senha.
        </p>
        <form onSubmit={handleResetPassword}>
          <div className="input-group">
            <label htmlFor="email-recupera">Email</label>
            <input id="email-recupera" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="auth-button">Enviar Link</button>
        </form>
        <div className="switch-page-link">
          <Link to="/login">Voltar para o Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;