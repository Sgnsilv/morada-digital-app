import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/pt-br';

import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

function AgendamentoPage() {
  // Estado para guardar os eventos (reservas) que vêm do banco de dados
  const [eventos, setEventos] = useState([]);

  // Estados para controlar os campos do nosso novo formulário
  const [titulo, setTitulo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [areaComum, setAreaComum] = useState('Salão de Festas');

  // --- LÓGICA PARA BUSCAR OS DADOS ---
  // Função para buscar as reservas no Firestore
  const buscarAgendamentos = async () => {
    const agendamentosCollection = collection(db, 'agendamentos');
    const agendamentosSnapshot = await getDocs(agendamentosCollection);
    
    // Transforma os dados do Firestore para o formato que o calendário entende
    const listaDeEventos = agendamentosSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        title: data.title,
        start: data.start.toDate(), // Firestore guarda datas em um formato especial, precisamos converter
        end: data.end.toDate(),     // com o método .toDate()
        resource: data.areaComum
      }
    });
    setEventos(listaDeEventos);
  };

  // useEffect para buscar os agendamentos quando a página carrega
  useEffect(() => {
    buscarAgendamentos();
  }, []);

  // --- LÓGICA PARA CRIAR UMA NOVA RESERVA ---
  const handleCriarAgendamento = async (e) => {
    e.preventDefault();

    if (!titulo || !dataInicio || !dataFim) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const novoEvento = {
      title: titulo,
      start: new Date(dataInicio), // Converte a string de data do formulário para um objeto Date
      end: new Date(dataFim),
      areaComum: areaComum,
      userId: auth.currentUser.uid, // Guarda o ID de quem fez a reserva
      userName: auth.currentUser.displayName || auth.currentUser.email, // E o nome/email
    };

    try {
      // Adiciona o novo evento à coleção 'agendamentos' no Firestore
      await addDoc(collection(db, "agendamentos"), novoEvento);
      alert("Agendamento criado com sucesso!");
      // Limpa o formulário e atualiza o calendário
      setTitulo('');
      setDataInicio('');
      setDataFim('');
      buscarAgendamentos();
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      alert("Ocorreu um erro ao criar o agendamento.");
    }
  };

  return (
    <div>
      <h2>Agendamento de Áreas Comuns </h2>
      <p>Visualize as datas ocupadas e planeje seu evento.</p>

      {/* Formulário para Nova Reserva */}
      <form onSubmit={handleCriarAgendamento} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
        <h3>Fazer Nova Reserva</h3>
        <input type="text" placeholder="Título do Evento" value={titulo} onChange={e => setTitulo(e.target.value)} style={{ marginRight: '10px' }}/>
        <select value={areaComum} onChange={e => setAreaComum(e.target.value)} style={{ marginRight: '10px' }}>
          <option value="Salão de Festas">Salão de Festas</option>
          <option value="Churrasqueira">Churrasqueira</option>
          <option value="Quadra">Quadra</option>
        </select>
        <label>Início:</label>
        <input type="datetime-local" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={{ marginRight: '10px' }} />
        <label>Fim:</label>
        <input type="datetime-local" value={dataFim} onChange={e => setDataFim(e.target.value)} style={{ marginRight: '10px' }} />
        <button type="submit">Agendar</button>
      </form>

      {/* Calendário */}
      <div style={{ height: '65vh' }}>
        <Calendar
          localizer={localizer}
          events={eventos}  // Agora usa os eventos do nosso estado, que vêm do Firestore
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          messages={{
              next: "Próximo",
              previous: "Anterior",
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              date: "Data",
              time: "Hora",
              event: "Evento (Área)",
          }}
          eventPropGetter={(event) => ({
            // Adiciona uma cor diferente para cada área comum
            style: {
              backgroundColor: event.resource === 'Churrasqueira' ? 'var(--light-green)' : 'var(--primary-green)',
            },
          })}
        />
      </div>
    </div>
  );
}

export default AgendamentoPage;