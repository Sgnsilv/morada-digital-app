import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, query, where, Timestamp, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import moment from 'moment';
import 'moment/locale/pt-br';
import { FiUserPlus, FiClipboard, FiTrash2, FiLogIn, FiLogOut } from 'react-icons/fi';
import './VisitantesPage.css';
import './PageContent.css';

// --- Componente do Formulário (definido fora, de forma independente) ---
function CadastrarVisitanteForm({ user, onVisitaAgendada }) {
  const [nome, setNome] = useState('');
  const [rg, setRg] = useState('');
  const [dataVisita, setDataVisita] = useState(moment().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !dataVisita) {
      alert("Preencha o nome e a data da visita.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "visitantes"), {
        nome: nome,
        rg: rg || 'Não informado',
        dataVisita: Timestamp.fromDate(new Date(dataVisita + 'T00:00:00')),
        moradorId: user.uid,
        moradorNome: user.profile.nome,
        status: 'aguardando',
        criadoEm: Timestamp.now()
      });
      alert("Visitante pré-cadastrado com sucesso!");
      setNome(''); setRg('');
      if(onVisitaAgendada) onVisitaAgendada();
    } catch (error) {
      console.error("Erro ao cadastrar visitante:", error);
      alert("Ocorreu um erro ao cadastrar o visitante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="visitante-form">
      <h3><FiUserPlus /> Pré-cadastrar Visitante</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="visita-nome">Nome do Visitante</label>
          <input id="visita-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="visita-rg">RG/Documento (Opcional)</label>
          <input id="visita-rg" type="text" value={rg} onChange={(e) => setRg(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="visita-data">Data da Visita</label>
          <input id="visita-data" type="date" value={dataVisita} onChange={(e) => setDataVisita(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Visitante'}</button>
      </div>
    </form>
  );
}

// --- Visão do Morador (definido fora, de forma independente) ---
function MoradorView({ user }) {
  const [minhasVisitas, setMinhasVisitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarMinhasVisitas = useCallback(async () => {
    setLoading(true);
    try {
      const visitantesRef = collection(db, "visitantes");
      const q = query(visitantesRef, where("moradorId", "==", user.uid), orderBy("dataVisita", "desc"));
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMinhasVisitas(lista);
    } catch (error) {
      console.error("Erro ao buscar visitas do morador:", error);
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    buscarMinhasVisitas();
  }, [buscarMinhasVisitas]);
  
  const handleDeleteVisita = async (visitaId) => {
    if (!window.confirm("Deseja cancelar este agendamento de visitante?")) return;
    try {
        await deleteDoc(doc(db, "visitantes", visitaId));
        alert("Agendamento de visitante cancelado.");
        buscarMinhasVisitas();
    } catch(error) {
        console.error("Erro ao cancelar visita:", error);
    }
  }

  return (
    <div className="morador-view">
      <CadastrarVisitanteForm user={user} onVisitaAgendada={buscarMinhasVisitas} />
      <div className="visitante-list-container">
        <h3>Meus Visitantes Agendados</h3>
        {loading ? <p>Carregando...</p> : minhasVisitas.length === 0 ? (
          <p>Nenhum visitante agendado.</p>
        ) : (
          <ul className="visitante-list">
            {minhasVisitas.map(v => (
              <li key={v.id}>
                <span className="visitante-nome">{v.nome}</span>
                <span className="visitante-info"> para <strong>{moment(v.dataVisita.toDate()).format('DD/MM/YYYY')}</strong></span>
                <span className={`visitante-status status-${v.status}`}>{v.status}</span>
                {v.status === 'aguardando' && 
                  <button title="Cancelar Visita" className="delete-visita-btn" onClick={() => handleDeleteVisita(v.id)}><FiTrash2/></button>
                }
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


// --- Visão da Portaria/Síndico (definido fora, de forma independente) ---
function PortariaView() {
  const [visitantesHoje, setVisitantesHoje] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarVisitantesDeHoje = useCallback(async () => {
    setLoading(true);
    const hoje = moment().startOf('day').toDate();
    const amanha = moment().endOf('day').toDate();
    try {
        const visitantesRef = collection(db, "visitantes");
        const q = query(visitantesRef, 
            where("dataVisita", ">=", hoje), 
            where("dataVisita", "<=", amanha),
            orderBy("dataVisita")
        );
        const querySnapshot = await getDocs(q);
        const listaVisitantes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVisitantesHoje(listaVisitantes);
    } catch (error) {
        console.error("Erro ao buscar visitantes:", error);
        alert("Ocorreu um erro ao buscar a lista. Verifique o console (F12).")
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarVisitantesDeHoje();
  }, [buscarVisitantesDeHoje]);

  const handleUpdateStatus = async (id, novoStatus) => {
    const visitanteDocRef = doc(db, "visitantes", id);
    try {
        await updateDoc(visitanteDocRef, { status: novoStatus });
        buscarVisitantesDeHoje();
    } catch(error) {
        console.error("Erro ao atualizar status:", error);
    }
  }

  return (
    <div className="portaria-view">
      <h3><FiClipboard /> Visitantes Esperados para Hoje</h3>
      <div className="visitante-list-container">
        {loading ? <p>Carregando...</p> : visitantesHoje.length === 0 ? (
          <p>Nenhum visitante pré-cadastrado para hoje.</p>
        ) : (
          <ul className="visitante-list">
            {visitantesHoje.map(v => (
              <li key={v.id}>
                <span className="visitante-nome">{v.nome}</span>
                <span className="visitante-info"> (RG: {v.rg}) - Visitando: <strong>{v.moradorNome}</strong></span>
                <span className={`visitante-status status-${v.status}`}>{v.status}</span>
                <div className="portaria-actions">
                    {v.status === 'aguardando' && 
                        <button onClick={() => handleUpdateStatus(v.id, 'chegou')}><FiLogIn/> Marcar Chegada</button>
                    }
                    {v.status === 'chegou' && 
                        <button onClick={() => handleUpdateStatus(v.id, 'saiu')}><FiLogOut/> Marcar Saída</button>
                    }
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- Componente Principal da Página (agora só renderiza os outros) ---
function VisitantesPage({ user }) {
  const perfil = user.profile?.tipo;

  return (
    <div className="page-content-card">
      <h2>Controle de Visitantes</h2>
      <p>Gerencie a entrada de visitantes para maior segurança e organização.</p>
      
      {(perfil === 'morador') && <MoradorView user={user} />}
      {(perfil === 'sindico' || perfil === 'funcionario') && <PortariaView />}
    </div>
  );
}

export default VisitantesPage;