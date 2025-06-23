# Morada Digital

## 📖 Sobre o Projeto

**Morada Digital** é uma plataforma web para gestão integrada de condomínios residenciais. [cite_start]O projeto nasceu da necessidade de superar as limitações dos sistemas atuais, que são em grande parte fragmentados, manuais e pouco eficientes. A solução busca centralizar as operações essenciais do dia a dia de um condomínio, promovendo uma comunicação mais clara e uma gestão mais transparente e eficaz.

Este projeto foi desenvolvido como parte das atividades da disciplina de CTA na Universidade Federal do Rio Grande do Norte (UFRN). [cite_start]A abordagem foi centrada no usuário, priorizando a acessibilidade e a usabilidade para os três perfis principais do ecossistema condominial.

## ✨ Funcionalidades Implementadas

Atualmente, a plataforma conta com os seguintes módulos funcionais:

* **Sistema de Autenticação Completo:**
    * Cadastro e Login com e-mail e senha.
    * Login social integrado com o Google.
    * Funcionalidade de "Recuperar Senha" com envio de e-mail.
    * Rotas protegidas e gestão de sessão de usuário.

* **Gestão de Perfis de Usuário:**
    * [cite_start]Diferenciação entre perfis: **síndico, morador e funcionário**.
    * Painel exclusivo para o síndico aprovar ou gerenciar novos cadastros, garantindo o controle de acesso ao condomínio.

* **Módulo de Agendamentos de Áreas Comuns:**
    * Calendário interativo para visualização de todas as reservas.
    * Formulário para criação de novas reservas, com validação que impede agendamentos duplicados no mesmo horário e local.
    * Permissão para que apenas o dono da reserva ou o síndico possam cancelá-la.
    * Diferenciação visual por cores para cada área comum no calendário.

* **Módulo de Comunicação (Mural de Avisos):**
    * O síndico possui uma interface para criar e publicar comunicados para todo o condomínio.
    * Todos os moradores logados podem visualizar o mural com os avisos em ordem cronológica.

* **Módulo de Gestão Documental:**
    * O síndico pode adicionar documentos importantes (atas, regimentos, etc.) através de links compartilháveis (ex: Google Drive).
    * Os moradores têm acesso a uma página centralizada para visualizar e baixar todos os documentos.

* **Módulo de Achados e Perdidos:**
    * Plataforma colaborativa onde qualquer usuário pode registrar um item que perdeu ou encontrou nas áreas comuns.
    * Lista de itens com status visual ("Achado" ou "Perdido") para facilitar a devolução.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando um conjunto de tecnologias para desenvolvimento web:

* **Frontend:**
    * **React.js:** Biblioteca principal para a construção da interface de usuário.
    * **CSS3:** Para estilização customizada dos componentes.

* **Backend (BaaS - Backend as a Service):**
    * **Firebase:** Plataforma utilizada para todos os serviços de backend.
        * **Firebase Authentication:** Para gestão de usuários (login, cadastro, etc.).
        * **Cloud Firestore:** Como banco de dados NoSQL para salvar todas as informações da aplicação (reservas, avisos, documentos, etc.).

* **Ferramentas de Desenvolvimento:**
    * **Git & GitHub:** Para controle de versão e hospedagem do código.
    * **VS Code & CodeSandbox:** Ambientes de desenvolvimento utilizados.


<!-- O aplicativo estará disponível em `http://localhost:3000`-->
