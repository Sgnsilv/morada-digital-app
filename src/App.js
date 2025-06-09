// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

import MainLayout from './componentes/MainLayout';
import LoginPage from './componentes/LoginPage';
import RegisterPage from './componentes/RegisterPage';
import ForgotPasswordPage from './componentes/ForgotPasswordPage';
import DashboardPage from './componentes/DashboardPage';
import AgendamentoPage from './componentes/AgendamentoPage'; 

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setCurrentUser({ uid: user.uid, email: user.email, profile: userDoc.data() });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/cadastro" element={!currentUser ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/recuperar-senha" element={!currentUser ? <ForgotPasswordPage /> : <Navigate to="/dashboard" />} />

        <Route path="/" element={currentUser ? <MainLayout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage user={currentUser} />} />
          <Route path="agendamentos" element={<AgendamentoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;