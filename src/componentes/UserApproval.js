import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

function UserApproval() {
  const [pendingUsers, setPendingUsers] = useState([]);

  // Função para buscar usuários pendentes no Firestore
  const fetchPendingUsers = async () => {
    try {
      const usersRef = collection(db, "users");
      // Cria uma consulta que busca por usuários com status "pendente"
      const q = query(usersRef, where("status", "==", "pendente"));
      
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id, // O id do documento é o uid do usuário
        ...doc.data()
      }));
      setPendingUsers(usersList);
    } catch (error) {
      console.error("Erro ao buscar usuários pendentes:", error);
    }
  };

  // Roda a busca quando o componente é montado
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApproveUser = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      // Atualiza o campo 'status' para 'aprovado'
      await updateDoc(userDocRef, {
        status: "aprovado"
      });
      alert("Usuário aprovado com sucesso!");
      // Atualiza a lista para remover o usuário recém-aprovado
      fetchPendingUsers();
    } catch (error) {
      console.error("Erro ao aprovar usuário:", error);
      alert("Erro ao aprovar usuário.");
    }
  };

  if (pendingUsers.length === 0) {
    return <p>Nenhum usuário aguardando aprovação.</p>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
      <h3>Aprovação de Novos Cadastros</h3>
      <ul>
        {pendingUsers.map(user => (
          <li key={user.id} style={{ marginBottom: '10px' }}>
            <strong>Nome:</strong> {user.nome} | <strong>Email:</strong> {user.email} | <strong>Tipo:</strong> {user.tipo}
            <button onClick={() => handleApproveUser(user.id)} style={{ marginLeft: '10px' }}>
              Aprovar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserApproval;