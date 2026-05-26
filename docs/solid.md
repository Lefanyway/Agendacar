# Aplicação de Princípios S.O.L.I.D. — AgendaCar

Este documento descreve como o back-end do AgendaCar aplica princípios S.O.L.I.D. na organização do código.

---

## 1. Single Responsibility Principle — SRP

Cada camada possui uma responsabilidade principal:

- Controllers: recebem requisições HTTP e retornam respostas;
- Services: concentram regras de negócio;
- Repositories: isolam acesso ao banco de dados;
- Models: representam entidades do sistema;
- Routes: definem endpoints;
- Middlewares: tratam autenticação e autorização.

Exemplo:

```txt
CarroController → entrada e saída HTTP
CarroService    → regra de negócio
CarroRepository → acesso ao banco
Carro           → entidade/modelo