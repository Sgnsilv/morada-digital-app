// src/componentes/MuralDeAvisosPage.js

import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import moment from "moment";
import "moment/locale/pt-br";
import "./MuralDeAvisosPage.css"; // Criaremos este arquivo a seguir

// --- Componente do Formulário (separado para organização) ---
function CriarAvisoForm({ onAvisoPostado }) {
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo || !mensagem) {
      alert("Por favor, preencha o título e a mensagem.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "avisos"), {
        titulo: titulo,
        mensagem: mensagem,
        autorNome: auth.currentUser.displayName || auth.currentUser.email,
        autorId: auth.currentUser.uid,
        criadoEm: serverTimestamp(),
      });
      alert("Aviso postado com sucesso!");
      setTitulo("");
      setMensagem("");
      onAvisoPostado(); // Função para atualizar a lista de avisos na página principal
    } catch (error) {
      console.error("Erro ao postar aviso:", error);
      alert("Ocorreu um erro ao postar o aviso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="aviso-form">
      <h3>Publicar Novo Aviso</h3>
      <div className="input-group">
        <label htmlFor="aviso-titulo">Título</label>
        <input
          id="aviso-titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Manutenção da Piscina"
          required
        />
      </div>
      <div className="input-group">
        <label htmlFor="aviso-mensagem">Mensagem</label>
        <textarea
          id="aviso-mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Digite o comunicado completo aqui..."
          rows="5"
          required
        ></textarea>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Publicando..." : "Publicar Aviso"}
      </button>
    </form>
  );
}

// --- Componente Principal da Página ---
function MuralDeAvisosPage({ user }) {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarAvisos = useCallback(async () => {
    setLoading(true);
    const avisosRef = collection(db, "avisos");
    const q = query(avisosRef, orderBy("criadoEm", "desc"));

    const querySnapshot = await getDocs(q);
    const listaDeAvisos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAvisos(listaDeAvisos);
    setLoading(false);
  }, []);

  useEffect(() => {
    buscarAvisos();
  }, [buscarAvisos]);

  const isSindico = user.profile?.tipo === "sindico";

  return (
    <div className="mural-container">
      <h2>Mural de Avisos</h2>
      <p>Fique por dentro dos últimos comunicados do condomínio.</p>

      {isSindico && <CriarAvisoForm onAvisoPostado={buscarAvisos} />}

      <div className="avisos-list">
        {loading ? (
          <p>Carregando avisos...</p>
        ) : avisos.length === 0 ? (
          <p>Nenhum aviso publicado no momento.</p>
        ) : (
          avisos.map((aviso) => (
            <div key={aviso.id} className="aviso-card">
              <h3>{aviso.titulo}</h3>
              <p className="aviso-mensagem">{aviso.mensagem}</p>
              <div className="aviso-footer">
                <span>
                  <strong>Publicado por:</strong> {aviso.autorNome}
                </span>
                <span>
                  {aviso.criadoEm
                    ? moment(aviso.criadoEm.toDate()).format(
                        "DD/MM/YYYY [às] HH:mm"
                      )
                    : "..."}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MuralDeAvisosPage;
