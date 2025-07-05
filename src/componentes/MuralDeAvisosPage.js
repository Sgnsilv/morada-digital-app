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
import "./MuralDeAvisosPage.css";

// Componente para o formulário de criação (visível apenas para o síndico)
function CriarAvisoForm({ onAvisoPostado }) {
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo || !mensagem) {
      alert("Por favor, preencha o título e a mensagem.");
      return;
    }

    try {
      await addDoc(collection(db, "avisos"), {
        titulo: titulo,
        mensagem: mensagem,
        autorNome: auth.currentUser.displayName || auth.currentUser.email,
        autorId: auth.currentUser.uid,
        criadoEm: serverTimestamp(), // Usa o timestamp do servidor para consistência
      });
      alert("Aviso postado com sucesso!");
      setTitulo("");
      setMensagem("");
      onAvisoPostado(); // Função para atualizar a lista de avisos na página principal
    } catch (error) {
      console.error("Erro ao postar aviso:", error);
      alert("Ocorreu um erro ao postar o aviso.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="aviso-form">
      <h3>Publicar Novo Aviso</h3>
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título do Aviso"
        required
      />
      <textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Digite sua mensagem aqui..."
        rows="5"
        required
      ></textarea>
      <button type="submit">Publicar</button>
    </form>
  );
}

function MuralDeAvisosPage({ user }) {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarAvisos = useCallback(async () => {
    setLoading(true);
    const avisosRef = collection(db, "avisos");
    // Ordena os avisos do mais recente para o mais antigo
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

  // Verifica se o usuário logado é um síndico
  const isSindico = user.profile?.tipo === "sindico";

  return (
    <div className="mural-container">
      <h2>Mural de Avisos</h2>

      {/* Mostra o formulário de criação apenas para o síndico */}
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
              <p>{aviso.mensagem}</p>
              <div className="aviso-footer">
                <span>Por: {aviso.autorNome}</span>
                {/* Verifica se o campo de data existe antes de formatar */}
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
