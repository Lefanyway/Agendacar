import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AgendaCar API",
      version: "1.0.0",
      description: "Documentação da API RESTful do sistema AgendaCar"
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor local"
      }
    ],
    tags: [
      { name: "Health", description: "Status da API" },
      { name: "Auth", description: "Cadastro, login e sessão" },
      { name: "Carros", description: "Consulta e administração de carros" },
      { name: "Reservas", description: "Agendamento e cancelamento de reservas" },
      { name: "Recomendações", description: "Recomendação inteligente de carros" },
      { name: "Chatbot", description: "Assistente virtual integrado ao Rasa" }
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

        AuthResposta: {
          type: "object",
          properties: {
            usuario: {
              type: "object",
              properties: {
                id: { type: "number", example: 1 },
                nome: { type: "string", example: "Administrador" },
                email: { type: "string", example: "admin@agendacar.com" },
                role: { type: "string", example: "admin" }
              }
            },
            token: {
              type: "string",
              example: "jwt.token.exemplo"
            }
          }
        },

        Carro: {
          type: "object",
          required: [
            "nome",
            "tipo",
            "capacidade",
            "transmissao",
            "tanque",
            "precoDia"
          ],
          properties: {
            id: { type: "number", example: 1 },
            nome: { type: "string", example: "Porsche 911" },
            tipo: { type: "string", example: "Sport" },
            imagem: {
              type: "string",
              example: "https://pngimg.com/uploads/porsche/porsche_PNG102845.png"
            },
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
            destino: { type: "string", example: "UniFECAF" }
          }
        },

        Reserva: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            carroId: { type: "number", example: 1 },
            usuarioId: { type: "number", example: 2 },
            dataInicio: { type: "string", example: "2026-06-01" },
            dataFim: { type: "string", example: "2026-06-05" },
            destino: { type: "string", example: "UniFECAF" },
            status: { type: "string", example: "ativa" },
            valorTotal: { type: "number", example: 14000 }
          }
        },

        RecomendacaoCarro: {
          type: "object",
          properties: {
            orcamentoDia: { type: "number", example: 300 },
            passageiros: { type: "number", example: 5 },
            tipoViagem: {
              type: "string",
              enum: ["economica", "familia", "esportiva", "luxo"],
              example: "familia"
            },
            transmissao: { type: "string", example: "Automático" }
          }
        },

        RecomendacaoResposta: {
          type: "object",
          properties: {
            carro: {
              $ref: "#/components/schemas/Carro"
            },
            score: { type: "number", example: 85 },
            justificativas: {
              type: "array",
              items: { type: "string" },
              example: [
                "Dentro do orçamento informado",
                "Capacidade compatível com a quantidade de passageiros",
                "Perfil adequado para viagem em família"
              ]
            }
          }
        },

        ChatbotMensagem: {
          type: "object",
          required: ["mensagem"],
          properties: {
            mensagem: {
              type: "string",
              example: "Quero reservar um carro"
            },
            sender: {
              type: "string",
              example: "usuario-agendacar"
            }
          }
        },

        ChatbotCard: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            nome: { type: "string", example: "Porsche 911" },
            tipo: { type: "string", example: "Sport" },
            imagem: {
              type: "string",
              nullable: true,
              example: "https://pngimg.com/uploads/porsche/porsche_PNG102845.png"
            },
            capacidade: { type: "number", example: 2 },
            transmissao: { type: "string", example: "Automático" },
            tanque: { type: "number", example: 64 },
            precoDia: { type: "number", example: 3500 },
            disponivel: { type: "boolean", example: true },
            acaoTexto: { type: "string", example: "Reservar agora" },
            url: { type: "string", example: "/carros/1" }
          }
        },

        ChatbotResposta: {
          type: "object",
          properties: {
            resposta: {
              type: "string",
              example:
                "Para reservar, escolha um carro disponível, informe as datas e confirme a reserva."
            },
            origem: {
              type: "string",
              enum: ["rasa", "fallback", "sistema"],
              example: "rasa"
            },
            cards: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ChatbotCard"
              }
            }
          }
        },

        Erro: {
          type: "object",
          properties: {
            erro: {
              type: "string",
              example: "Mensagem de erro."
            }
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
              description: "API funcionando",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      message: {
                        type: "string",
                        example: "AgendaCar API funcionando"
                      },
                      timestamp: {
                        type: "string",
                        example: "2026-06-01T10:00:00.000Z"
                      }
                    }
                  }
                }
              }
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
                schema: { $ref: "#/components/schemas/UsuarioCadastro" }
              }
            }
          },
          responses: {
            201: {
              description: "Usuário cadastrado com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResposta" }
                }
              }
            },
            400: {
              description: "Erro de validação",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Erro" }
                }
              }
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
                schema: { $ref: "#/components/schemas/UsuarioLogin" }
              }
            }
          },
          responses: {
            200: {
              description: "Login realizado com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResposta" }
                }
              }
            },
            401: {
              description: "Credenciais inválidas",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Erro" }
                }
              }
            }
          }
        }
      },

      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Retorna os dados do usuário autenticado",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Dados do usuário autenticado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResposta" }
                }
              }
            },
            401: {
              description: "Token inválido ou ausente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Erro" }
                }
              }
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
              description: "Lista de carros retornada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Carro" }
                  }
                }
              }
            }
          }
        },

        post: {
          tags: ["Carros"],
          summary: "Cria um novo carro",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Carro" }
              }
            }
          },
          responses: {
            201: {
              description: "Carro criado com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Carro" }
                }
              }
            },
            401: { description: "Token não informado" },
            403: { description: "Acesso permitido apenas para administrador" }
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
              description: "Carro encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Carro" }
                }
              }
            },
            404: { description: "Carro não encontrado" }
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
              schema: { type: "number" },
              example: 1
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Carro" }
              }
            }
          },
          responses: {
            200: {
              description: "Carro atualizado com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Carro" }
                }
              }
            },
            401: { description: "Token não informado" },
            403: { description: "Acesso permitido apenas para administrador" },
            404: { description: "Carro não encontrado" }
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
              schema: { type: "number" },
              example: 1
            }
          ],
          responses: {
            200: { description: "Carro removido com sucesso" },
            401: { description: "Token não informado" },
            403: { description: "Acesso permitido apenas para administrador" },
            404: { description: "Carro não encontrado" }
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
              description: "Lista de reservas",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Reserva" }
                  }
                }
              }
            },
            401: { description: "Token não informado" }
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
                schema: { $ref: "#/components/schemas/ReservaCriacao" }
              }
            }
          },
          responses: {
            201: {
              description: "Reserva criada com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Reserva" }
                }
              }
            },
            400: { description: "Erro ao criar reserva" },
            401: { description: "Token não informado" }
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
              schema: { type: "number" },
              example: 1
            }
          ],
          responses: {
            200: {
              description: "Reserva cancelada com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Reserva" }
                }
              }
            },
            400: { description: "Erro ao cancelar reserva" },
            401: { description: "Token não informado" }
          }
        }
      },

      "/recomendacoes/carros": {
        post: {
          tags: ["Recomendações"],
          summary: "Recomenda o carro mais adequado para o perfil informado",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RecomendacaoCarro" }
              }
            }
          },
          responses: {
            200: {
              description: "Carro recomendado com score e justificativas",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RecomendacaoResposta"
                  }
                }
              }
            },
            400: {
              description: "Erro ao gerar recomendação",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Erro" }
                }
              }
            }
          }
        }
      },

      "/chatbot": {
        post: {
          tags: ["Chatbot"],
          summary: "Envia uma mensagem para o chatbot do AgendaCar",
          description:
            "Recebe uma mensagem do usuário, consulta o Rasa e retorna uma resposta para o front-end.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatbotMensagem" }
              }
            }
          },
          responses: {
            200: {
              description: "Resposta gerada pelo chatbot",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ChatbotResposta" }
                }
              }
            },
            400: {
              description: "Mensagem não informada",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Erro" }
                }
              }
            },
            500: {
              description: "Erro ao processar mensagem do chatbot",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Erro" }
                }
              }
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