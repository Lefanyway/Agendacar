# Testes manuais do chatbot AgendaCar

Use estes prompts depois de subir o backend/front ou o proxy. O criterio principal e conferir `intent`, `showCards` e se os cards aparecem somente quando permitido.

| Prompt | Intent esperada | showCards | Observacao |
| --- | --- | --- | --- |
| oi | saudacao | false | Saudacao curta, sem cards. |
| quero reservar um carro | reservar_carro | true | Deve listar cards reais quando houver frota retornada. |
| quero alugar um carro para amanha | reservar_carro | true | Nao deve afirmar disponibilidade real para amanha. |
| me mostra todos os carros | consultar_carros | true | Cards devem aparecer no front. |
| quais carros voces tem? | consultar_carros | true | Cards devem aparecer no front. |
| onde vejo minhas reservas? | minhas_reservas | false | Nunca mostrar cards. |
| minhas reservas | minhas_reservas | false | Nunca mostrar cards. |
| quero cancelar minha reserva | cancelar_reserva | false | Nunca mostrar cards nem dizer que cancelou. |
| quero alterar minha reserva | alterar_reserva | false | Orientar Minhas Reservas. |
| quero pagar minha reserva | pagamento | false | Orientar tela de pagamento. |
| esqueci minha senha | problema_login | false | Nao pedir senha no chat. |
| sou admin | area_admin | false | Nao conceder permissao. |
| qual a capital da Franca? | fora_escopo | false | Responder apenas escopo AgendaCar. |
| reserva | fallback | false | Pedir esclarecimento. |
| carro | fallback | false | Pedir esclarecimento. |
| ??? | fallback | false | Pedir reformulacao. |
|  | fallback | false | Mensagem vazia nao deve quebrar. |
