// src/componentes/LoginPage.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './AuthPages.css'; // Usando o nosso CSS unificado

// Importamos a imagem do logo da pasta assets
import logoMoradaDigital from '../assets/logo.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Erro no login:", error.code);
      let msg = "Ocorreu um erro. Verifique seu e-mail e senha.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msg = "E-mail ou senha inválidos.";
      }
      alert(`Morada Digital informa: ${msg}`);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          nome: user.displayName,
          email: user.email,
          tipo: 'morador',
          status: 'aprovado'
        });
      }
    } catch (error) {
      console.error("Erro no login com Google:", error.code);
      alert("Morada Digital informa: Erro ao tentar fazer login com Google.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* LOGO ADICIONADO AQUI */}
        <div className="auth-logo-container">
          <img src={logoMoradaDigital} alt="Logo Morada Digital" className="auth-logo" />
        </div>

        <h2>Bem Vindo!</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <div className="form-options">
              <label htmlFor="password">Senha</label>
              <Link to="/recuperar-senha" className="forgot-password">Esqueceu a senha?</Link>
            </div>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" required />
          </div>
          <button type="submit" className="auth-button">LOGIN</button>
        </form>

        <div className="divider">ou</div>
        
        <button type="button" className="google-button" onClick={handleGoogleSignIn}>
          Continuar com Google
        </button>

        <div className="switch-page-link">
          <span>Não Possui Cadastro? </span>
          <Link to="/cadastro">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;