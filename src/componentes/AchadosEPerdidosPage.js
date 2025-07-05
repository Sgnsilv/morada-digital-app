import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import moment from "moment";
import "moment/locale/pt-br";
import {
  FiTag,
  FiMapPin,
  FiInfo,
  FiPlusCircle,
  FiCheckSquare,
} from "react-icons/fi";
import "./AchadosEPerdidosPage.css";

// --- Componente do Formulário para registrar um novo item ---
function ItemForm({ onPostSuccess }) {
  const [titulo, setTitulo] = useState("");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("perdido");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo || !local || !descricao) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "achadosEPerdidos"), {
        titulo: titulo,
        local: local,
        descricao: descricao,
        status: status,
        autorNome: auth.currentUser.displayName || auth.currentUser.email,
        autorId: auth.currentUser.uid,
        criadoEm: serverTimestamp(),
      });
      alert("Item registrado com sucesso!");
      setTitulo("");
      setLocal("");
      setDescricao("");
      onPostSuccess();
    } catch (error) {
      console.error("Erro ao registrar item:", error);
      alert("Ocorreu um erro ao registrar o item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <h3>
        <FiPlusCircle /> Registrar um Item
      </h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="item-titulo">O que é o item?</label>
          <input
            id="item-titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Chave de carro, óculos de sol"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="item-status">Status</label>
          <select
            id="item-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="perdido">Eu perdi</option>
            <option value="achado">Eu achei</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="item-local">
          Onde foi visto por último / encontrado?
        </label>
        <input
          id="item-local"
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Ex: Perto da piscina, no elevador social"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="item-desc">Descrição</label>
        <textarea
          id="item-desc"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Dê mais detalhes sobre o item..."
          rows="4"
          required
        ></textarea>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Registrando..." : "Registrar Item"}
      </button>
    </form>
  );
}

// --- Componente Principal da Página ---
function AchadosEPerdidosPage({ user }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarItens = useCallback(async () => {
    setLoading(true);
    try {
      const itensRef = collection(db, "achadosEPerdidos");
      const q = query(
        itensRef,
        where("status", "!=", "arquivado"),
        orderBy("status"),
        orderBy("criadoEm", "desc")
      );

      const querySnapshot = await getDocs(q);
      const listaItens = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItens(listaItens);
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      alert(
        "Não foi possível carregar os itens. Pode ser necessário criar um índice no Firebase. Verifique o console (F12)."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarItens();
  }, [buscarItens]);

  const handleReivindicarItem = async (itemId) => {
    if (
      !window.confirm(
        "Você confirma a interação com este item? Ele será arquivado."
      )
    ) {
      return;
    }

    try {
      const itemDocRef = doc(db, "achadosEPerdidos", itemId);
      await updateDoc(itemDocRef, {
        status: "arquivado",
        reivindicadoPorId: auth.currentUser.uid,
        reivindicadoPorNome: user.profile?.nome || user.email,
        reivindicadoEm: serverTimestamp(),
      });
      alert("Ação registrada com sucesso! O item foi arquivado.");
      buscarItens();
    } catch (error) {
      console.error("Erro ao arquivar item:", error);
      alert("Ocorreu um erro ao registrar a ação.");
    }
  };

  return (
    <div className="achados-e-perdidos-container">
      {/* Esta funcionalidade de Achados e Perdidos atende a um dos objetivos do projeto. */}
      <h2>Achados e Perdidos</h2>
      <p>Registre itens perdidos ou encontrados para ajudar seus vizinhos.</p>

      <ItemForm onPostSuccess={buscarItens} />

      <div className="itens-list">
        {loading ? (
          <p>Carregando itens...</p>
        ) : itens.length === 0 ? (
          <p>Nenhum item perdido ou achado no momento.</p>
        ) : (
          itens.map((item) => (
            <div key={item.id} className={`item-card status-${item.status}`}>
              <div className="item-card-status">{item.status}</div>
              <h3>
                <FiTag /> {item.titulo}
              </h3>
              <p className="item-card-desc">
                <FiInfo /> {item.descricao}
              </p>
              <p className="item-card-local">
                <FiMapPin /> Visto em: {item.local}
              </p>
              <div className="item-card-footer">
                <span>Registrado por: {item.autorNome}</span>
                <span>
                  {item.criadoEm
                    ? moment(item.criadoEm.toDate()).format("DD/MM/YYYY")
                    : ""}
                </span>
              </div>

              {/* Lógica do botão de interação */}
              {user.uid !== item.autorId && (
                <div className="item-card-action">
                  <button onClick={() => handleReivindicarItem(item.id)}>
                    <FiCheckSquare />
                    {item.status === "achado" ? "É meu!" : "Encontrei!"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AchadosEPerdidosPage;
