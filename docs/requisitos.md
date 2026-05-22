\# Requisitos do Projeto — AgendaCar



\## 1. Visão geral



O AgendaCar é uma aplicação web para aluguel e agendamento de carros. O sistema permite que usuários visualizem veículos disponíveis, filtrem opções, façam reservas e acompanhem seus agendamentos. Também possui uma área administrativa para gerenciamento dos veículos cadastrados.



\## 2. Problema



Locadoras e serviços de aluguel de veículos precisam oferecer uma experiência digital simples, organizada e rápida para consulta de carros, criação de reservas e controle administrativo.



Muitos processos de reserva ainda são feitos de forma manual ou pouco integrada, dificultando a visualização de disponibilidade, preços e histórico de agendamentos.



\## 3. Público-alvo



\### Usuário final

Pessoas que desejam alugar um carro de forma prática, visualizando opções disponíveis, preços, características e realizando reservas online.



\### Administrador

Responsáveis pela operação do sistema, com permissão para cadastrar, editar, remover e controlar veículos disponíveis na plataforma.



\## 4. Objetivo do sistema



Desenvolver uma aplicação web full-stack, responsiva e funcional, que integre frontend, backend, banco de dados e recursos de inteligência aplicada para melhorar a experiência de aluguel e agendamento de carros.



\## 5. Requisitos funcionais



\### RF01 — Cadastro de usuário

O sistema deve permitir que novos usuários criem uma conta informando nome, email e senha.



\### RF02 — Login de usuário

O sistema deve permitir que usuários cadastrados realizem login com email e senha.



\### RF03 — Autenticação com token

O sistema deve gerar um token JWT para usuários autenticados.



\### RF04 — Listagem de carros

O sistema deve listar os carros disponíveis para aluguel.



\### RF05 — Detalhe do carro

O sistema deve permitir que o usuário visualize detalhes de um carro específico.



\### RF06 — Filtro de carros

O sistema deve permitir filtrar carros por busca textual, tipo e disponibilidade.



\### RF07 — Ordenação de carros

O sistema deve permitir ordenar carros por menor preço, maior preço e maior capacidade.



\### RF08 — Reserva de carro

O sistema deve permitir que um usuário autenticado crie uma reserva informando carro, data inicial, data final e destino.



\### RF09 — Cálculo do valor da reserva

O sistema deve calcular automaticamente o valor total da reserva com base na quantidade de dias e no preço diário do carro.



\### RF10 — Listagem de reservas do usuário

O sistema deve permitir que o usuário visualize suas próprias reservas.



\### RF11 — Cancelamento de reserva

O sistema deve permitir que o usuário cancele uma reserva, alterando seu status para cancelada.



\### RF12 — Área administrativa

O sistema deve possuir uma área administrativa para gerenciamento dos carros.



\### RF13 — Cadastro de carro

O administrador deve poder cadastrar novos carros.



\### RF14 — Edição de carro

O administrador deve poder editar informações de carros cadastrados.



\### RF15 — Remoção de carro

O administrador deve poder remover carros cadastrados.



\### RF16 — Controle de acesso administrativo

Apenas usuários com perfil de administrador devem acessar ações administrativas.



\### RF17 — Recomendação inteligente de carro

O sistema deve recomendar um carro com base em critérios como orçamento, quantidade de passageiros, tipo de viagem e transmissão desejada.



\### RF18 — Chatbot de atendimento

O sistema deve possuir um assistente virtual para orientar o usuário sobre carros, reservas e uso da plataforma.



\### RF19 — Documentação da API

O sistema deve disponibilizar documentação dos endpoints por meio do Swagger.



\## 6. Requisitos não funcionais



\### RNF01 — Responsividade

A interface deve funcionar em diferentes tamanhos de tela, incluindo desktop e dispositivos móveis.



\### RNF02 — Usabilidade

O sistema deve possuir navegação intuitiva, botões claros e feedback visual para o usuário.



\### RNF03 — Segurança de senha

As senhas dos usuários devem ser armazenadas de forma criptografada.



\### RNF04 — Segurança de rotas

Rotas administrativas devem ser protegidas por autenticação e autorização.



\### RNF05 — Persistência de dados

Os dados do sistema devem ser persistidos em banco de dados PostgreSQL.



\### RNF06 — API RESTful

O backend deve seguir o padrão REST para organização dos endpoints.



\### RNF07 — Organização em camadas

O backend deve ser estruturado com separação entre controllers, services e repositories.



\### RNF08 — Documentação técnica

O projeto deve conter documentação de requisitos, arquitetura, tecnologias utilizadas e instruções de execução.



\### RNF09 — Manutenibilidade

O código deve ser organizado de forma modular, facilitando manutenção e evolução.



\### RNF10 — Configuração por ambiente

Variáveis sensíveis, como conexão com banco e chaves, devem ser configuradas por meio de arquivos `.env`.



\## 7. Regras de negócio



\### RN01 — Email único

Não deve ser possível cadastrar dois usuários com o mesmo email.



\### RN02 — Senha mínima

A senha do usuário deve possuir no mínimo 6 caracteres.



\### RN03 — Reserva apenas para usuário autenticado

Apenas usuários logados podem criar e visualizar reservas.



\### RN04 — Cancelamento restrito

Um usuário só pode cancelar reservas pertencentes a ele mesmo.



\### RN05 — Administração restrita

Apenas usuários com perfil `admin` podem criar, editar ou remover carros.



\### RN06 — Cálculo de diária

O valor total da reserva deve ser calculado multiplicando a quantidade de dias pelo preço diário do carro.



\### RN07 — Data final maior que data inicial

A data final da reserva deve ser maior que a data inicial.



\### RN08 — Recomendação apenas com carros disponíveis

A recomendação de carros deve considerar apenas veículos disponíveis.



\## 8. Escopo do MVP



O MVP contempla:



\- cadastro e login de usuários;

\- autenticação com JWT;

\- listagem de carros;

\- filtros e ordenação;

\- criação e cancelamento de reservas;

\- área administrativa para CRUD de carros;

\- banco de dados PostgreSQL via Supabase;

\- documentação Swagger;

\- recomendação inteligente de carros;

\- chatbot de suporte.



\## 9. Evoluções futuras



Como melhorias futuras, o projeto pode evoluir com:



\- integração de pagamento real;

\- painel administrativo com indicadores;

\- envio de email de confirmação;

\- upload de imagens dos veículos;

\- integração completa com OpenAI, Dialogflow ou Rasa para chatbot;

\- modelo de Machine Learning treinado com histórico real de reservas;

\- sistema de avaliações dos carros;

\- controle mais avançado de disponibilidade por período.

