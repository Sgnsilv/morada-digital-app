import React from 'react';
import UserApproval from './UserApproval'; 

function DashboardPage({ user }) {
  return (
    <div>
      <div className="welcome-message">
        <h1>Bem-vindo de volta, {user.profile?.nome || user.email}!</h1>
        <p>Este é o seu painel de controle. Use a navegação acima para acessar as funcionalidades.</p>
        <p>Seu perfil é: <strong>{user.profile?.tipo}</strong></p>
      </div>
      
      <hr />

      {user.profile?.tipo === 'sindico' && (
        <UserApproval />
      )}
      
      {user.profile?.tipo === 'morador' && (
        <p>Bem-vindo, morador! Utilize as abas de navegação acima.</p>
      )}
    </div>
  );
}

export default DashboardPage;