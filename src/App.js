import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Layouts e Páginas
import MainLayout from "./componentes/MainLayout";
import LoginPage from "./componentes/LoginPage";
import RegisterPage from "./componentes/RegisterPage";
import ForgotPasswordPage from "./componentes/ForgotPasswordPage";
import DashboardPage from "./componentes/DashboardPage";
import MuralDeAvisosPage from "./componentes/MuralDeAvisosPage";
import DocumentosPage from "./componentes/DocumentosPage"; // Importe a nova página

// Componentes da Seção de Agendamentos
import AgendamentoLayout from "./componentes/AgendamentoLayout";
import CalendarioPage from "./componentes/CalendarioPage";
import MinhasReservasPage from "./componentes/MinhasReservasPage";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            profile: userDoc.data(),
          });
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
        {/* Rotas Públicas */}
        <Route
          path="/login"
          element={!currentUser ? <LoginPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/cadastro"
          element={
            !currentUser ? <RegisterPage /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/recuperar-senha"
          element={
            !currentUser ? <ForgotPasswordPage /> : <Navigate to="/dashboard" />
          }
        />

        {/* Rotas Protegidas que usam o MainLayout */}
        <Route
          path="/"
          element={currentUser ? <MainLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route
            path="dashboard"
            element={<DashboardPage user={currentUser} />}
          />
          <Route
            path="mural-de-avisos"
            element={<MuralDeAvisosPage user={currentUser} />}
          />

          {/* NOVA ROTA PARA DOCUMENTOS, DENTRO DO LAYOUT PRINCIPAL */}
          <Route
            path="documentos"
            element={<DocumentosPage user={currentUser} />}
          />

          {/* Estrutura Aninhada para a Seção de Agendamentos */}
          <Route path="agendamentos" element={<AgendamentoLayout />}>
            <Route index element={<Navigate to="calendario" replace />} />
            <Route
              path="calendario"
              element={<CalendarioPage user={currentUser} />}
            />
            <Route
              path="minhas-reservas"
              element={<MinhasReservasPage user={currentUser} />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
