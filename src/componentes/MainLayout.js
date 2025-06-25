import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import "./MainLayout.css";
// Adicionamos o novo ícone aqui
import {
  FiGrid,
  FiCalendar,
  FiMessageSquare,
  FiFileText,
  FiHelpCircle,
  FiLogOut,
  FiUsers,
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
          <NavLink to="/documentos" className="nav-link">
            <FiFileText className="nav-icon" />
            <span>Documentos</span>
          </NavLink>
          <NavLink to="/achados-e-perdidos" className="nav-link">
            <FiHelpCircle className="nav-icon" />
            <span>Achados e Perdidos</span>
          </NavLink>
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          <FiLogOut className="nav-icon" />
          <span>Sair</span>
        </button>
      </header>
      <NavLink to="/visitantes" className="nav-link">
        <FiUsers className="nav-icon" />
        <span>Visitantes</span>
      </NavLink>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
