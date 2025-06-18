import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/pt-br";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import "./CalendarioPage.css";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

const calendarMessages = {
  next: "Próximo",
  previous: "Anterior",
  today: "Hoje",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
};

const calendarStyleGetter = (event) => {
  // Define uma cor padrão
  let backgroundColor = "var(--primary-green)";

  // Verifica qual é a área comum do evento e muda a cor
  switch (event.resource) {
    case "Churrasqueira":
      backgroundColor = "var(--light-green)"; // Nosso verde claro
      break;
    case "Quadra":
      backgroundColor = "#3498db"; // Um tom de azul para a quadra
      break;
    case "Salão de Festas":
      backgroundColor = "var(--primary-green)"; // Nosso verde escuro
      break;
    default:
      backgroundColor = "#777"; // Uma cor cinza para qualquer outra área
  }

  // Cria o objeto de estilo com a cor que definimos
  const style = {
    backgroundColor: backgroundColor,
    borderRadius: "5px",
    color: "white",
    border: "0px",
    display: "block",
  };

  return {
    style: style,
  };
};

const calendarStyle = {
  height: 500,
};
// ---------------------------------------------

function CalendarioPage({ user }) {
  const [eventos, setEventos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [areaComum, setAreaComum] = useState("Salão de Festas");
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Usamos useCallback para "memorizar" a função e evitar que ela seja recriada.
  const buscarAgendamentos = useCallback(async () => {
    const agendamentosSnapshot = await getDocs(collection(db, "agendamentos"));
    const listaDeEventos = agendamentosSnapshot.docs.map((d) => ({
      id: d.id,
      title: d.data().title,
      start: d.data().start.toDate(),
      end: d.data().end.toDate(),
      resource: d.data().areaComum,
      userId: d.data().userId,
    }));
    setEventos(listaDeEventos);
  }, []);

  useEffect(() => {
    buscarAgendamentos();
  }, [buscarAgendamentos]);

  const handleCriarAgendamento = async (e) => {
    e.preventDefault();

    if (!titulo || !dataInicio || !dataFim) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const novaDataInicio = new Date(dataInicio);
    const novaDataFim = new Date(dataFim);

    if (novaDataFim <= novaDataInicio) {
      alert("A data final deve ser posterior à data de início.");
      return;
    }

    try {
      // --- INÍCIO DA LÓGICA DE VERIFICAÇÃO ---
      const agendamentosRef = collection(db, "agendamentos");

      // Consulta 1: Verifica se há eventos que começam DURANTE o novo evento
      const q1 = query(
        agendamentosRef,
        where("areaComum", "==", areaComum),
        where("start", ">=", novaDataInicio),
        where("start", "<", novaDataFim)
      );

      // Consulta 2: Verifica se há eventos que terminam DURANTE o novo evento
      const q2 = query(
        agendamentosRef,
        where("areaComum", "==", areaComum),
        where("end", ">", novaDataInicio),
        where("end", "<=", novaDataFim)
      );

      // Consulta 3: Verifica se há eventos que ENGLOBAM o novo evento
      const q3 = query(
        agendamentosRef,
        where("areaComum", "==", areaComum),
        where("start", "<=", novaDataInicio),
        where("end", ">=", novaDataFim)
      );

      const querySnapshot1 = await getDocs(q1);
      const querySnapshot2 = await getDocs(q2);
      const querySnapshot3 = await getDocs(q3);

      // Se qualquer uma das consultas retornar algum documento, significa que há um conflito.
      if (
        !querySnapshot1.empty ||
        !querySnapshot2.empty ||
        !querySnapshot3.empty
      ) {
        alert(
          "Erro: Este horário e área já estão reservados. Por favor, escolha outro horário."
        );
        return; // Para a execução da função aqui
      }
      // --- FIM DA LÓGICA DE VERIFICAÇÃO ---

      // Se não houver conflitos, prosseguimos para criar o novo evento
      const novoEvento = {
        title: titulo,
        start: novaDataInicio,
        end: novaDataFim,
        areaComum: areaComum,
        userId: auth.currentUser.uid,
        userName: user.profile?.nome || user.email,
      };

      await addDoc(collection(db, "agendamentos"), novoEvento);
      alert("Agendamento criado com sucesso!");
      setTitulo("");
      setDataInicio("");
      setDataFim("");
      buscarAgendamentos();
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      alert("Ocorreu um erro ao criar o agendamento.");
    }
  };

  // Memorizando as funções que são passadas como props para o Calendário e Modal
  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setShowModal(true);
  }, []);

  const handleDeleteBooking = useCallback(
    async (eventId) => {
      if (!window.confirm("Você tem certeza que deseja cancelar esta reserva?"))
        return;
      try {
        await deleteDoc(doc(db, "agendamentos", eventId));
        alert("Reserva cancelada com sucesso!");
        setShowModal(false);
        buscarAgendamentos();
      } catch (error) {
        console.error("Erro ao cancelar reserva:", error);
        alert("Ocorreu um erro ao cancelar a reserva.");
      }
    },
    [buscarAgendamentos]
  );

  return (
    <div>
      {/* Esta funcionalidade de agendamento está alinhada com os objetivos do projeto. */}
      <h2>Agendamento de Áreas Comuns</h2>
      <p>Visualize as datas ocupadas e planeje seu evento.</p>

      <form onSubmit={handleCriarAgendamento} className="booking-form">
        <h3>Fazer Nova Reserva</h3>
        <div className="form-row">
          <div className="form-group" style={{ minWidth: "200px" }}>
            <label htmlFor="titulo">Título do Evento</label>
            <input
              id="titulo"
              type="text"
              placeholder="Ex: Festa de Aniversário"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="area">Área Comum</label>
            <select
              id="area"
              value={areaComum}
              onChange={(e) => setAreaComum(e.target.value)}
            >
              <option value="Salão de Festas">Salão de Festas</option>
              <option value="Churrasqueira">Churrasqueira</option>
              <option value="Quadra">Quadra</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="inicio">Início</label>
            <input
              id="inicio"
              type="datetime-local"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="fim">Fim</label>
            <input
              id="fim"
              type="datetime-local"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
          <button type="submit">Agendar</button>
        </div>
      </form>

      <div style={{ height: "65vh" }}>
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          messages={calendarMessages}
          eventPropGetter={calendarStyleGetter}
          style={calendarStyle}
        />
      </div>

      {showModal && selectedEvent && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Detalhes da Reserva</h3>
            <p>
              <strong>Título:</strong> {selectedEvent.title}
            </p>
            <p>
              <strong>Área:</strong> {selectedEvent.resource}
            </p>
            <p>
              <strong>Início:</strong>{" "}
              {moment(selectedEvent.start).format("DD/MM/YYYY HH:mm")}
            </p>
            <p>
              <strong>Fim:</strong>{" "}
              {moment(selectedEvent.end).format("DD/MM/YYYY HH:mm")}
            </p>

            {(user.uid === selectedEvent.userId ||
              user.profile?.tipo === "sindico") && (
              <button
                className="cancel-button"
                onClick={() => handleDeleteBooking(selectedEvent.id)}
              >
                Cancelar Reserva{" "}
                {user.profile?.tipo === "sindico" ? "(Ação do Síndico)" : ""}
              </button>
            )}
            <button
              className="close-button"
              onClick={() => setShowModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarioPage;
