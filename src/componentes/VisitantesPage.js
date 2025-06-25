import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import moment from "moment";
import "moment/locale/pt-br";
import { FiUserPlus, FiClipboard } from "react-icons/fi";
import "./VisitantesPage.css";

// --- Formulário para o Morador Cadastrar Visitante ---
function CadastrarVisitanteForm({ user, onVisitaAgendada }) {
  const [nome, setNome] = useState("");
  const [rg, setRg] = useState("");
  const [dataVisita, setDataVisita] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !dataVisita) {
      alert("Por favor, preencha pelo menos o nome e a data da visita.");
      return;
    }
    setLoading(true);
    try {
      // Adiciona o novo visitante na coleção 'visitantes'
      await addDoc(collection(db, "visitantes"), {
        nome: nome,
        rg: rg || "Não informado",
        // Salva a data no início do dia para facilitar a busca
        dataVisita: Timestamp.fromDate(new Date(dataVisita + "T00:00:00")),
        moradorId: user.uid,
        moradorNome: user.profile.nome,
        status: "aguardando", // Status inicial
        criadoEm: Timestamp.now(),
      });
      alert("Visitante pré-cadastrado com sucesso!");
      setNome("");
      setRg("");
      onVisitaAgendada(); // Atualiza a lista de visitantes do morador
    } catch (error) {
      console.error("Erro ao cadastrar visitante:", error);
      alert("Ocorreu um erro ao cadastrar o visitante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="visitante-form">
      <h3>
        <FiUserPlus /> Pré-cadastrar Visitante
      </h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="visita-nome">Nome do Visitante</label>
          <input
            id="visita-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="visita-rg">RG/Documento (Opcional)</label>
          <input
            id="visita-rg"
            type="text"
            value={rg}
            onChange={(e) => setRg(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="visita-data">Data da Visita</label>
          <input
            id="visita-data"
            type="date"
            value={dataVisita}
            onChange={(e) => setDataVisita(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Visitante"}
        </button>
      </div>
    </form>
  );
}

// --- Visão da Portaria/Síndico ---
function PortariaView() {
  const [visitantesHoje, setVisitantesHoje] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarVisitantesDeHoje = useCallback(async () => {
    setLoading(true);
    const hoje = moment().startOf("day").toDate();
    const amanha = moment().endOf("day").toDate();

    try {
      const visitantesRef = collection(db, "visitantes");
      const q = query(
        visitantesRef,
        where("dataVisita", ">=", hoje),
        where("dataVisita", "<=", amanha)
      );

      const querySnapshot = await getDocs(q);
      const listaVisitantes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVisitantesHoje(listaVisitantes);
    } catch (error) {
      console.error("Erro ao buscar visitantes:", error);
      alert(
        "Ocorreu um erro ao buscar a lista de visitantes. Verifique o console (F12) para um possível erro sobre criação de 'índice' no Firebase."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarVisitantesDeHoje();
  }, [buscarVisitantesDeHoje]);

  return (
    <div className="portaria-view">
      <h3>
        <FiClipboard /> Visitantes Esperados para Hoje
      </h3>
      <div className="visitante-list-container">
        {loading ? (
          <p>Carregando...</p>
        ) : visitantesHoje.length === 0 ? (
          <p>Nenhum visitante pré-cadastrado para hoje.</p>
        ) : (
          <ul className="visitante-list">
            {visitantesHoje.map((v) => (
              <li key={v.id}>
                <span className="visitante-nome">{v.nome}</span>
                <span className="visitante-info">
                  {" "}
                  (RG: {v.rg}) - Visitando: <strong>{v.moradorNome}</strong>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- Componente Principal da Página ---
function VisitantesPage({ user }) {
  console.log("DADOS DO USUÁRIO NA PÁGINA DE VISITANTES:", user);

  const perfil = user.profile?.tipo;

  return (
    <div className="visitantes-container">
      <h2>Controle de Visitantes</h2>
      <p>
        Gerencie a entrada de visitantes para maior segurança e organização.
      </p>

      {perfil === "morador" && (
        <CadastrarVisitanteForm user={user} onVisitaAgendada={() => {}} />
      )}
      {(perfil === "sindico" || perfil === "funcionario") && <PortariaView />}
    </div>
  );
}

export default VisitantesPage;
