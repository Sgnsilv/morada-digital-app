import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import "./MainLayout.css";
import {
  FiGrid,
  FiCalendar,
  FiMessageSquare,
  FiFileText,
  FiHelpCircle,
  FiUsers,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";

function MainLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`main-layout ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
      <aside className="sidebar">
        <div className="logo">{isSidebarOpen ? "Morada Digital" : "MD"}</div>
        <nav className="main-nav">
          <NavLink to="/dashboard" className="nav-link" title="Painel">
            <FiGrid className="nav-icon" />
            <span>Painel</span>
          </NavLink>
          <NavLink to="/agendamentos" className="nav-link" title="Agendamentos">
            <FiCalendar className="nav-icon" />
            <span>Agendamentos</span>
          </NavLink>
          <NavLink
            to="/mural-de-avisos"
            className="nav-link"
            title="Mural de Avisos"
          >
            <FiMessageSquare className="nav-icon" />
            <span>Mural de Avisos</span>
          </NavLink>
          <NavLink to="/documentos" className="nav-link" title="Documentos">
            <FiFileText className="nav-icon" />
            <span>Documentos</span>
          </NavLink>
          <NavLink
            to="/achados-e-perdidos"
            className="nav-link"
            title="Achados e Perdidos"
          >
            <FiHelpCircle className="nav-icon" />
            <span>Achados e Perdidos</span>
          </NavLink>
          <NavLink to="/visitantes" className="nav-link" title="Visitantes">
            <FiUsers className="nav-icon" />
            <span>Visitantes</span>
          </NavLink>
        </nav>
        <button className="logout-button" onClick={handleLogout} title="Sair">
          <FiLogOut className="nav-icon" />
          <span>Sair</span>
        </button>
      </aside>

      <div className="content-wrapper">
        <header className="top-bar">
          <button
            onClick={toggleSidebar}
            className="sidebar-toggle"
            title="Alternar menu"
          >
            <FiMenu />
          </button>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
