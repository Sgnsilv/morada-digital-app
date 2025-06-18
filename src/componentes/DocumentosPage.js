// src/componentes/DocumentosPage.js

import React, { useState, useEffect, useCallback } from "react";
// REMOVEMOS AS IMPORTAÇÕES DO STORAGE
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig"; // Não precisamos mais do storage aqui
import { FiFileText, FiDownload, FiUploadCloud } from "react-icons/fi";
import "./DocumentosPage.css";

// --- Formulário de Upload MODIFICADO ---
function UploadForm({ onUploadSuccess }) {
  // REMOVEMOS o estado 'file' e adicionamos 'link'
  const [link, setLink] = useState("");
  const [titulo, setTitulo] = useState("");
  const [loading, setLoading] = useState(false);

  // A função de upload agora é muito mais simples
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!link || !titulo) {
      alert("Por favor, preencha o título e o link do documento.");
      return;
    }

    setLoading(true);

    try {
      // Agora salvamos o link diretamente no Firestore
      await addDoc(collection(db, "documentos"), {
        titulo: titulo,
        fileName: "Link externo", // Podemos colocar um nome genérico
        url: link, // Salvamos a URL que o síndico colou
        criadoEm: serverTimestamp(),
        uploaderId: auth.currentUser.uid,
      });

      alert("Documento adicionado com sucesso!");
      setLink("");
      setTitulo("");
      onUploadSuccess();
    } catch (error) {
      console.error("Erro ao adicionar documento:", error);
      alert("Ocorreu um erro ao adicionar o documento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="doc-form">
      <h3>
        <FiUploadCloud /> Adicionar Novo Documento
      </h3>
      <div className="form-row">
        <div className="form-group" style={{ flexGrow: 2 }}>
          <label htmlFor="doc-titulo">Título do Documento</label>
          <input
            id="doc-titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Ata da Reunião de Maio"
            required
          />
        </div>
        <div className="form-group" style={{ flexGrow: 3 }}>
          {/* TROCAMOS O INPUT DE ARQUIVO POR UM INPUT DE LINK */}
          <label htmlFor="doc-link">Link Compartilhável do Arquivo</label>
          <input
            id="doc-link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Cole aqui o link do Google Drive, Dropbox, etc."
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Adicionando..." : "Adicionar"}
        </button>
      </div>
    </form>
  );
}

// --- A PÁGINA PRINCIPAL CONTINUA IGUAL ---
function DocumentosPage({ user }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarDocumentos = useCallback(async () => {
    /* ... sua função de buscar continua a mesma ... */
  }, []);

  useEffect(() => {
    buscarDocumentos();
  }, [buscarDocumentos]);

  const isSindico = user.profile?.tipo === "sindico";

  return (
    <div className="documentos-container">
      <h2>Documentos do Condomínio</h2>
      <p>Acesse atas, regimentos, comunicados e outros arquivos importantes.</p>

      {isSindico && <UploadForm onUploadSuccess={buscarDocumentos} />}

      <div className="doc-list">
        {loading ? (
          <p>Carregando documentos...</p>
        ) : (
          documentos.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="doc-card"
            >
              <FiFileText className="doc-icon" />
              <div className="doc-info">
                <h4>{doc.titulo}</h4>
                <span>Clique para abrir o documento em uma nova aba.</span>
              </div>
              <FiDownload className="download-icon" />
            </a>
          ))
        )}
      </div>
    </div>
  );
}

export default DocumentosPage;
