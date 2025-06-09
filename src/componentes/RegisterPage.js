import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import './AuthPages.css';

function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('morador');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, "users", user.uid), {
        nome: nome,
        email: email,
        tipo: tipoUsuario,
        status: 'pendente'
      });

    } catch (error) {
      console.error("Erro no cadastro:", error.code);
      let mensagemErro = "Ocorreu um erro inesperado.";
      if (error.code === 'auth/email-already-in-use') {
        mensagemErro = "Este e-mail já está em uso.";
      } else if (error.code === 'auth/weak-password') {
        mensagemErro = "A senha precisa de no mínimo 6 caracteres.";
      }
      alert(`Morada Digital informa: ${mensagemErro}`);
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
      alert("Morada Digital informa: Erro ao tentar login com Google.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Crie sua Conta</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="nome">Nome Completo</label>
            <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="email-cadastro">Email</label>
            <input id="email-cadastro" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="senha-cadastro">Senha</label>
            <input id="senha-cadastro" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
          </div>
          <div className="input-group">
            <label htmlFor="tipoUsuario">Eu sou:</label>
            <select id="tipoUsuario" value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)}>
              <option value="morador">Morador</option> 
              <option value="sindico">Síndico</option> 
              <option value="funcionario">Funcionário da Portaria</option>
            </select>
          </div>
          <button type="submit" className="auth-button">Criar Conta</button>
        </form>
        <div className="divider">ou</div>
        <button type="button" className="google-button" onClick={handleGoogleSignIn}>
          Continuar com Google
        </button>
        <div className="switch-page-link">
          <span>Já possui uma conta? </span>
          <Link to="/login">Faça o login</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;