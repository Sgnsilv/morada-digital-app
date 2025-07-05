import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import {
  FiFileText,
  FiDownload,
  FiUploadCloud,
  FiTrash2,
} from "react-icons/fi";
import "./DocumentosPage.css";

function UploadForm({ onUploadSuccess }) {
  // O código do formulário de upload continua o mesmo
  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo || !link) {
      alert("Por favor, preencha o título e o link do documento.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "documentos"), {
        titulo: titulo,
        url: link,
        fileName: "Link externo",
        criadoEm: serverTimestamp(),
        uploaderId: auth.currentUser.uid,
      });
      alert("Documento adicionado com sucesso!");
      setTitulo("");
      setLink("");
      onUploadSuccess();
    } catch (error) {
      console.error("Erro ao adicionar documento:", error);
      alert("Ocorreu um erro ao adicionar o documento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="doc-form">
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

function DocumentosPage({ user }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarDocumentos = useCallback(async () => {
    setLoading(true);
    const docsRef = collection(db, "documentos");
    const q = query(docsRef, orderBy("criadoEm", "desc"));
    const querySnapshot = await getDocs(q);
    const listaDocs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDocumentos(listaDocs);
    setLoading(false);
  }, []);

  useEffect(() => {
    buscarDocumentos();
  }, [buscarDocumentos]);

  const handleDeleteDocument = async (e, docId) => {
    e.preventDefault();
    if (!window.confirm("Tem certeza que deseja excluir este documento?"))
      return;
    try {
      await deleteDoc(doc(db, "documentos", docId));
      alert("Documento excluído com sucesso!");
      buscarDocumentos();
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
    }
  };

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
            // A ESTRUTURA DO CARD FOI ATUALIZADA AQUI
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
              <div className="doc-actions">
                {isSindico && (
                  <button
                    className="delete-button"
                    title="Excluir Documento"
                    onClick={(e) => handleDeleteDocument(e, doc.id)}
                  >
                    <FiTrash2 />
                  </button>
                )}
                <FiDownload className="download-icon" />
              </div>
            </a>
          ))
        )}
        {/* Adiciona uma mensagem se não houver documentos */}
        {!loading && documentos.length === 0 && (
          <p>Nenhum documento encontrado.</p>
        )}
      </div>
    </div>
  );
}

export default DocumentosPage;
