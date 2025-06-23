import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AgendamentoLayout.css";

function AgendamentoLayout() {
  return (
    <div className="agendamento-layout">
      <nav className="sub-nav">
        <NavLink to="/agendamentos/calendario" className="sub-nav-link">
          Ver Calendário
        </NavLink>
        <NavLink to="/agendamentos/minhas-reservas" className="sub-nav-link">
          Minhas Reservas
        </NavLink>
      </nav>
      <div className="agendamento-content">
        {/* As páginas (calendário ou minhas reservas) serão renderizadas aqui no Outlet */}
        <Outlet />
      </div>
    </div>
  );
}

export default AgendamentoLayout;
