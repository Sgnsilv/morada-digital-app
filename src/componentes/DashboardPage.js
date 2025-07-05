import React from "react";
import UserApproval from "./UserApproval";
import "./DashboardPage.css"; // Crie este novo arquivo de estilo

function DashboardPage({ user }) {
  return (
    // Envolvemos tudo nesta div com a nova classe
    <div className="page-content-card">
      <div className="welcome-message">
        <h1>Bem-vindo de volta, {user.profile?.nome || user.email}!</h1>
        <p>
          Este é o seu painel de controle. Use a navegação na lateral para
          acessar as funcionalidades.
        </p>
        <p>
          Seu perfil é: <strong>{user.profile?.tipo}</strong>
        </p>
      </div>
      <hr />
      {user.profile?.tipo === "sindico" && <UserApproval />}
      {user.profile?.tipo === "morador" && (
        <p>Bem-vindo, morador! Utilize o menu ao lado para navegar.</p>
      )}
    </div>
  );
}

export default DashboardPage;
