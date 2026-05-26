# Arquitetura do Projeto AgendaCar

## 1. Visão Geral

O AgendaCar é uma aplicação web para aluguel e agendamento de veículos.

O sistema permite que usuários consultem carros disponíveis, filtrem opções, visualizem detalhes dos veículos, realizem reservas e acompanhem seus agendamentos.

Além da área do usuário final, o projeto possui uma área administrativa para gerenciamento da frota e um chatbot integrado ao Rasa para auxiliar o usuário durante o uso da plataforma.

---

## 2. Objetivo da Arquitetura

A arquitetura do projeto foi pensada para separar responsabilidades entre as principais partes do sistema:

- Interface do usuário;
- API back-end;
- Regras de negócio;
- Acesso ao banco de dados;
- Persistência das informações;
- Integração com chatbot.

Essa separação facilita manutenção, organização do código, testes, evolução futura e entendimento técnico durante a apresentação.

---

## 3. Visão Geral da Solução

Fluxo principal da aplicação:

```txt
Usuário
  ↓
Front-end React + Vite
  ↓
Back-end Node.js + Express + TypeScript
  ↓
Banco de Dados PostgreSQL
```

Fluxo do chatbot:

```txt
Usuário
  ↓
Componente Chatbot no Front-end
  ↓
Endpoint POST /chatbot no Back-end
  ↓
API do Rasa
  ↓
Back-end
  ↓
Front-end
```

---

## 4. Camadas da Aplicação

## 4.1 Front-end

O front-end é responsável pela interface visual e pela interação com o usuário.

Tecnologias utilizadas:

- React;
- Vite;
- React Router DOM;
- Tailwind CSS;
- Axios;
- Framer Motion;
- Lucide React.

Principais responsabilidades:

- Exibir telas da aplicação;
- Controlar navegação entre páginas;
- Consumir a API do back-end;
- Exibir carros cadastrados;
- Permitir filtros e ordenação;
- Enviar dados de login, cadastro e reservas;
- Exibir respostas do chatbot;
- Controlar acesso visual às áreas de usuário e administrador.

Principais pastas:

```txt
frontend/src/components
frontend/src/pages
frontend/src/services
frontend/src/contexts
```

### Components

Contém componentes reutilizáveis da interface, como Navbar, cards de carros, chatbot e elementos visuais.

### Pages

Contém as páginas principais da aplicação, como Login, Cadastro, Home, Detalhe do Carro, Reservas, Pagamento e Admin.

### Services

Centraliza a comunicação HTTP com a API back-end, usando Axios.

### Contexts

Controla estados globais da aplicação, como autenticação do usuário.

---

## 4.2 Back-end

O back-end é responsável por expor a API RESTful, processar regras de negócio e integrar o sistema com banco de dados e chatbot.

Tecnologias utilizadas:

- Node.js;
- Express;
- TypeScript;
- Sequelize;
- JWT;
- Swagger.

Principais responsabilidades:

- Disponibilizar endpoints REST;
- Controlar autenticação;
- Validar permissões de administrador;
- Processar regras de negócio;
- Criar, listar, editar e remover carros;
- Criar e consultar reservas;
- Integrar com o banco de dados;
- Integrar com o chatbot Rasa;
- Documentar endpoints via Swagger.

Principais pastas:

```txt
backend/src/controllers
backend/src/services
backend/src/repositories
backend/src/models
backend/src/routes
backend/src/middlewares
backend/src/config
backend/src/seeders
```

---

## 5. Organização do Back-end

## 5.1 Controllers

Os controllers recebem as requisições HTTP e retornam as respostas para o cliente.

Eles não concentram regras complexas de negócio. Sua função principal é intermediar a entrada e saída de dados.

Exemplos:

```txt
CarroController
UsuarioController
ReservaController
ChatbotController
```

---

## 5.2 Services

Os services concentram as regras de negócio da aplicação.

Exemplos de responsabilidades:

- Validar criação de reservas;
- Calcular valor total;
- Processar recomendação de veículos;
- Consultar o Rasa;
- Organizar respostas do chatbot;
- Garantir regras antes de acessar o banco.

Exemplos:

```txt
CarroService
UsuarioService
ReservaService
ChatbotService
RecomendacaoService
```

---

## 5.3 Repositories

Os repositories isolam o acesso ao banco de dados.

Essa camada evita que controllers e services dependam diretamente da implementação do banco.

Exemplos:

```txt
CarroRepository
UsuarioRepository
ReservaRepository
```

---

## 5.4 Models

Os models representam as entidades principais do sistema.

Principais entidades:

```txt
Usuario
Carro
Reserva
```

Essas entidades são mapeadas com Sequelize para persistência no PostgreSQL.

---

## 5.5 Routes

As rotas definem os endpoints disponíveis na API.

Principais grupos de rotas:

```txt
/auth
/carros
/reservas
/recomendacoes
/chatbot
```

---

## 5.6 Middlewares

Os middlewares são utilizados para processamentos intermediários antes da execução dos controllers.

Exemplos:

- Verificar se o usuário está autenticado;
- Validar token JWT;
- Verificar se o usuário possui permissão de administrador.

---

## 6. Banco de Dados

O projeto utiliza PostgreSQL como banco de dados relacional, integrado ao back-end por meio do Sequelize.

Principais tabelas:

- Usuários;
- Carros;
- Reservas.

Relacionamentos principais:

```txt
Usuário 1:N Reservas
Carro   1:N Reservas
```

Ou seja:

- Um usuário pode possuir várias reservas;
- Um carro pode aparecer em várias reservas;
- Cada reserva pertence a um usuário e a um carro.

---

## 7. Autenticação e Segurança

A autenticação é feita com JWT.

Fluxo de autenticação:

```txt
Usuário realiza login
  ↓
Back-end valida email e senha
  ↓
Back-end gera token JWT
  ↓
Front-end armazena o token
  ↓
Token é enviado nas requisições protegidas
  ↓
Back-end valida o token antes de liberar acesso
```

Rotas protegidas:

- Criação de reservas;
- Consulta de reservas do usuário;
- Cancelamento de reservas;
- Área administrativa;
- Cadastro, edição e remoção de carros.

A área administrativa exige que o usuário tenha perfil de administrador.

---

## 8. Chatbot

O chatbot foi implementado com Rasa e integrado ao sistema por meio do back-end.

Fluxo técnico:

```txt
Usuário envia mensagem no front-end
  ↓
Front-end chama POST /chatbot
  ↓
Back-end recebe a mensagem
  ↓
Back-end envia a mensagem para o Rasa
  ↓
Rasa interpreta a intenção
  ↓
Rasa retorna a resposta
  ↓
Back-end devolve resposta ao front-end
```

O chatbot responde dúvidas sobre:

- Reserva de carros;
- Consulta de veículos;
- Modelos disponíveis;
- Cancelamento de reserva;
- Pagamento;
- Login e cadastro;
- Área administrativa;
- Suporte geral.

Caso o Rasa esteja indisponível, o back-end possui uma resposta de fallback para evitar que a aplicação quebre.

---

## 9. Swagger

A API é documentada com Swagger.

A documentação pode ser acessada em:

```txt
http://localhost:3001/api-docs
```

O Swagger documenta endpoints de:

- Health check;
- Autenticação;
- Carros;
- Reservas;
- Recomendações;
- Chatbot.

Essa documentação facilita testes, entendimento dos contratos da API e apresentação técnica do projeto.

---

## 10. Decisões Técnicas

## 10.1 React + Vite

O React foi escolhido pela componentização e facilidade de criação de interfaces dinâmicas.

O Vite foi utilizado por oferecer ambiente de desenvolvimento rápido e configuração simples.

---

## 10.2 Node.js + Express + TypeScript

O Node.js com Express foi escolhido para criação da API REST.

O TypeScript foi utilizado para trazer tipagem ao back-end, reduzindo erros e melhorando a manutenção.

---

## 10.3 Sequelize + PostgreSQL

O Sequelize foi escolhido para mapear entidades do sistema e facilitar a comunicação com o banco relacional.

O PostgreSQL foi escolhido por ser robusto, relacional e adequado para representar usuários, carros e reservas.

---

## 10.4 JWT

O JWT foi utilizado para autenticação porque permite proteger rotas e identificar o usuário logado sem manter sessão no servidor.

---

## 10.5 Rasa

O Rasa foi escolhido para implementar um chatbot treinável, com intents, rules e respostas configuráveis.

Ele permite que o sistema tenha uma camada de inteligência conversacional integrada à aplicação.

---

## 10.6 Swagger

O Swagger foi usado para documentar e testar os endpoints da API.

Isso melhora a clareza técnica do projeto e facilita a apresentação para professores e avaliadores.

---

## 11. Benefícios da Arquitetura

A arquitetura adotada oferece os seguintes benefícios:

- Separação clara de responsabilidades;
- Código mais organizado;
- Facilidade de manutenção;
- Melhor entendimento do fluxo da aplicação;
- Possibilidade de evolução futura;
- API documentada;
- Integração com banco de dados;
- Integração com chatbot;
- Melhor preparação para apresentação técnica.

---

## 12. Possíveis Evoluções Futuras

O projeto pode evoluir com:

- Integração com gateway de pagamento real;
- Controle avançado de disponibilidade por período;
- Upload de imagens dos veículos;
- Painel administrativo com indicadores;
- Envio de email de confirmação;
- Histórico de pagamentos;
- Avaliação de veículos;
- Melhorias no treinamento do chatbot;
- Modelo de recomendação com dados reais de uso.

---

## 13. Conclusão

O AgendaCar utiliza uma arquitetura full-stack organizada em camadas, integrando front-end, back-end, banco de dados, documentação Swagger e chatbot.

Essa estrutura atende aos principais requisitos acadêmicos do projeto e permite demonstrar, na prática, conceitos de desenvolvimento web moderno, API RESTful, persistência de dados, autenticação e inteligência aplicada por meio de chatbot.