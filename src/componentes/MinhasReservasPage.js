// src/componentes/MinhasReservasPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import moment from 'moment';
import './MinhasReservasPage.css';

function MinhasReservasPage() {
  const [minhasReservas, setMinhasReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarMinhasReservas = useCallback(async () => {
    if (!auth.currentUser) return;
    const agendamentosRef = collection(db, 'agendamentos');
    const q = query(agendamentosRef, where("userId", "==", auth.currentUser.uid));
    
    const querySnapshot = await getDocs(q);
    const listaDeReservas = querySnapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })).sort((a, b) => b.start.toDate() - a.start.toDate());

    setMinhasReservas(listaDeReservas);
    setLoading(false);
  }, []);

  useEffect(() => {
    buscarMinhasReservas();
  }, [buscarMinhasReservas]);

  const handleCancelarReserva = async (reservaId) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;
    try {
      await deleteDoc(doc(db, "agendamentos", reservaId));
      alert("Reserva cancelada com sucesso!");
      buscarMinhasReservas();
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
    }
  };

  if (loading) {
    return <p>Carregando suas reservas...</p>;
  }

  return (
    <div className="minhas-reservas-container">
      <h2>Minhas Reservas</h2>
      {minhasReservas.length === 0 ? (
        <p>Você ainda não fez nenhuma reserva.</p>
      ) : (
        <ul className="reservas-list">
          {minhasReservas.map(reserva => (
            <li key={reserva.id} className="reserva-card">
              <div className="reserva-card-header">
                <h3>{reserva.title}</h3>
              </div>
              <div className="reserva-card-body">
                <p><strong>Área:</strong> {reserva.areaComum}</p>
                <p><strong>Início:</strong> {moment(reserva.start.toDate()).format('DD/MM/YYYY [às] HH:mm')}</p>
                <p><strong>Fim:</strong> {moment(reserva.end.toDate()).format('DD/MM/YYYY [às] HH:mm')}</p>
              </div>
              <div className="reserva-card-footer">
                {/* Indicador de Status com cor condicional */}
                <span className={`reserva-status status-${reserva.status}`}>
                  {reserva.status}
                </span>
                <button className="cancel-button" onClick={() => handleCancelarReserva(reserva.id)}>
                  Cancelar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MinhasReservasPage;