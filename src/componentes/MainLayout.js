import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import "./MainLayout.css";
import {
  FiGrid,
  FiCalendar,
  FiMessageSquare,
  FiFileText,
  FiLogOut,
} from "react-icons/fi";

function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="logo">Morada Digital</div>
        <nav className="main-nav">
          <NavLink to="/dashboard" className="nav-link">
            <FiGrid className="nav-icon" />
            <span>Painel</span>
          </NavLink>
          <NavLink to="/agendamentos" className="nav-link">
            <FiCalendar className="nav-icon" />
            <span>Agendamentos</span>
          </NavLink>
          <NavLink to="/mural-de-avisos" className="nav-link">
            <FiMessageSquare className="nav-icon" />
            <span>Mural de Avisos</span>
          </NavLink>
          {/* LINK CORRETO PARA A PÁGINA DE DOCUMENTOS */}
          <NavLink to="/documentos" className="nav-link">
            <FiFileText className="nav-icon" />
            <span>Documentos</span>
          </NavLink>
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          <FiLogOut className="nav-icon" />
          <span>Sair</span>
        </button>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
