# SGE - Sistema de Gestão de Estágios

## Objetivo do Sistema

O **SGE (Sistema de Gestão de Estágios)** é uma aplicação web para gerenciar contratos de estágio entre alunos e orientadores. O sistema permite que:

- **Alunos** cadastrem seus dados, criem contratos de estágio, anexem documentos e acompanhem o status das solicitações
- **Orientadores** acompanhem os contratos dos quais são responsáveis, façam análises, solicitem correções, aprovem ou reprovem estágios, e adicionem documentos
- Ambas as partes utilizem um **chat integrado** para comunicação sobre cada contrato

## Tecnologias Utilizadas

### Backend
- **Java 21**
- **Spring Boot 3.5.6** – Framework para API REST
- **Spring Data JPA** – Persistência e acesso a dados
- **Spring Security** – Autenticação e autorização
- **JWT (JSON Web Token)** – Autenticação stateless
- **MySQL** – Banco de dados relacional

### Frontend
- **TypeScript**
- **React 19** – Biblioteca para interfaces
- **Vite 7** – Build tool e servidor de desenvolvimento
- **React Router DOM** – Roteamento
- **Axios** – Requisições HTTP
- **Bootstrap 5** – Estilização e componentes
- **React Bootstrap Icons** – Ícones

## Funcionalidades

### Autenticação
- Cadastro de usuários (alunos e orientadores)
- Login com email e senha
- Autenticação via JWT
- Redirecionamento para conclusão do perfil quando incompleto

### Perfil de Usuário
- **Alunos**: Nome, CPF, RG, telefone, curso, matrícula, endereço completo
- **Orientadores**: Nome, email, CPF, telefone, departamento, especialidade, curso que orienta (sem endereço)

### Cursos
- Listagem de cursos cadastrados
- Cada curso pode ter um orientador associado
- Página de Ajuda exibindo cursos e orientadores responsáveis com nome e email

### Contratos de Estágio
- **Criação**: Alunos criam contratos informando empresa, datas, cargo, setor e selecionando orientador do seu curso
- **Visualização**: Detalhes do contrato, status, documentos e chat
- **Listagem**: Alunos veem seus contratos; orientadores veem apenas contratos dos quais são responsáveis
- **Edição**: Orientadores podem editar documentos do contrato

### Documentos
- Upload de documentos anexados aos contratos (PDF, JPG, PNG, DOC, DOCX)
- Download e exclusão de documentos
- Carrossel de visualização dos documentos

### Chat e Fluxo de Aprovação
- Mensagens por contrato
- Ações do orientador: **Enviar e aprovar**, **Enviar e solicitar resposta**, **Enviar para correção**
- Acompanhamento do status do contrato (Pendente, Em Análise, Correção Solicitada, Aprovado, Reprovado, Finalizado)

### Página de Ajuda
- Lista de cursos disponíveis
- Orientador responsável por cada curso (nome e email)
- Instruções por curso para assinatura de estágio

## Como Executar

### Pré-requisitos
- Java 21
- Node.js (LTS recomendado)
- MySQL

### Backend
1. Configure o banco MySQL (create database sge)
2. Ajuste `application.properties` com as credenciais do banco
3. Execute: `./mvnw spring-boot:run` (ou `mvn spring-boot:run`)

### Frontend
1. Entre na pasta `sge-front`
2. Instale as dependências: `npm install`
3. Execute: `npm run dev`