import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AgendaCar API",
      version: "1.0.0",
      description: "Documentação da API do sistema AgendaCar"
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor local"
      }
    ],
    tags: [
      { name: "Health", description: "Status da API" },
      { name: "Auth", description: "Cadastro e autenticação" },
      { name: "Carros", description: "Consulta e administração de carros" },
      { name: "Reservas", description: "Agendamento e cancelamento de reservas" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        UsuarioCadastro: {
          type: "object",
          required: ["nome", "email", "senha"],
          properties: {
            nome: { type: "string", example: "Felipe Teste" },
            email: { type: "string", example: "felipe@email.com" },
            senha: { type: "string", example: "123456" }
          }
        },
        UsuarioLogin: {
          type: "object",
          required: ["email", "senha"],
          properties: {
            email: { type: "string", example: "admin@agendacar.com" },
            senha: { type: "string", example: "admin123" }
          }
        },
        Carro: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            nome: { type: "string", example: "Porsche 911" },
            tipo: { type: "string", example: "Sport" },
            imagem: { type: "string", example: "/img/porsche.png" },
            capacidade: { type: "number", example: 2 },
            transmissao: { type: "string", example: "Automático" },
            tanque: { type: "number", example: 64 },
            precoDia: { type: "number", example: 3500 },
            disponivel: { type: "boolean", example: true }
          }
        },
        ReservaCriacao: {
          type: "object",
          required: ["carroId", "dataInicio", "dataFim"],
          properties: {
            carroId: { type: "number", example: 1 },
            dataInicio: { type: "string", example: "2026-06-01" },
            dataFim: { type: "string", example: "2026-06-05" },
            destino: { type: "string", example: "São Paulo" }
          }
        }
      }
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Verifica se a API está funcionando",
          responses: {
            200: {
              description: "API funcionando"
            }
          }
        }
      },
      "/auth/cadastrar": {
        post: {
          tags: ["Auth"],
          summary: "Cadastra um novo usuário",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UsuarioCadastro"
                }
              }
            }
          },
          responses: {
            201: {
              description: "Usuário cadastrado com sucesso"
            },
            400: {
              description: "Erro de validação"
            }
          }
        }
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Realiza login e retorna token JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UsuarioLogin"
                }
              }
            }
          },
          responses: {
            200: {
              description: "Login realizado com sucesso"
            },
            401: {
              description: "Credenciais inválidas"
            }
          }
        }
      },
      "/carros": {
        get: {
          tags: ["Carros"],
          summary: "Lista carros com filtros e ordenação",
          parameters: [
            {
              name: "busca",
              in: "query",
              schema: { type: "string" },
              example: "Porsche"
            },
            {
              name: "tipo",
              in: "query",
              schema: { type: "string" },
              example: "Sport"
            },
            {
              name: "disponivel",
              in: "query",
              schema: { type: "string", enum: ["true", "false"] },
              example: "true"
            },
            {
              name: "ordenar",
              in: "query",
              schema: {
                type: "string",
                enum: ["preco-asc", "preco-desc", "capacidade-desc"]
              },
              example: "preco-asc"
            }
          ],
          responses: {
            200: {
              description: "Lista de carros"
            }
          }
        },
        post: {
          tags: ["Carros"],
          summary: "Cria um carro novo",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Carro"
                }
              }
            }
          },
          responses: {
            201: {
              description: "Carro criado"
            },
            401: {
              description: "Token não informado"
            },
            403: {
              description: "Apenas admin"
            }
          }
        }
      },
      "/carros/{id}": {
        get: {
          tags: ["Carros"],
          summary: "Busca carro por ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "number" },
              example: 1
            }
          ],
          responses: {
            200: {
              description: "Carro encontrado"
            },
            404: {
              description: "Carro não encontrado"
            }
          }
        },
        put: {
          tags: ["Carros"],
          summary: "Atualiza um carro",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "number" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Carro"
                }
              }
            }
          },
          responses: {
            200: {
              description: "Carro atualizado"
            }
          }
        },
        delete: {
          tags: ["Carros"],
          summary: "Remove um carro",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "number" }
            }
          ],
          responses: {
            200: {
              description: "Carro removido"
            }
          }
        }
      },
      "/reservas": {
        get: {
          tags: ["Reservas"],
          summary: "Lista reservas do usuário logado",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Lista de reservas"
            },
            401: {
              description: "Token não informado"
            }
          }
        },
        post: {
          tags: ["Reservas"],
          summary: "Cria uma reserva",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ReservaCriacao"
                }
              }
            }
          },
          responses: {
            201: {
              description: "Reserva criada"
            },
            400: {
              description: "Erro ao criar reserva"
            }
          }
        }
      },
      "/reservas/{id}/cancelar": {
        patch: {
          tags: ["Reservas"],
          summary: "Cancela uma reserva",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "number" }
            }
          ],
          responses: {
            200: {
              description: "Reserva cancelada"
            },
            400: {
              description: "Erro ao cancelar reserva"
            }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}