Abaixo está a estrutura atualizada, normalizada e com os relacionamentos ajustados. Mantive sua ideia original, mas separei vendas, itens, pagamentos e movimentações de estoque para permitir operações mais completas.

# Modelo de banco de dados atualizado

## 1. PESSOA

Cadastro centralizado de pessoas.

| Campo         | Tipo         | Observação    |
| ------------- | ------------ | ------------- |
| id            | BIGINT       | PK            |
| nome          | VARCHAR(150) | Nome completo |
| cpf           | VARCHAR(14)  | UNIQUE        |
| telefone      | VARCHAR(20)  | Contato       |
| email         | VARCHAR(150) | E-mail        |
| dt_nascimento | DATE         | Nascimento    |
| created_at    | DATETIME     | Cadastro      |
| updated_at    | DATETIME     | Atualização   |

## 2. CLIENTE

Informações específicas do cliente.

| Campo            | Tipo        | Observação        |
| ---------------- | ----------- | ----------------- |
| id_pessoa        | BIGINT      | PK, FK → PESSOA   |
| pref_horario     | VARCHAR(50) | Horário preferido |
| pref_servico     | BIGINT      | FK → SERVICO      |
| pref_colaborador | BIGINT      | FK → COLABORADOR  |

## 3. COLABORADOR

Informações específicas dos funcionários.

| Campo          | Tipo          | Observação      |
| -------------- | ------------- | --------------- |
| id_pessoa      | BIGINT        | PK, FK → PESSOA |
| especializacao | VARCHAR(150)  | Especialidade   |
| salario        | DECIMAL(10,2) | Remuneração     |
| data_admissao  | DATE          | Admissão        |
| status         | ENUM          | Ativo/Inativo   |

## 4. COLABORADOR_DISPONIBILIDADE

Permite cadastrar vários horários de disponibilidade por colaborador.

| Campo          | Tipo    | Observação       |
| -------------- | ------- | ---------------- |
| id             | BIGINT  | PK               |
| id_colaborador | BIGINT  | FK → COLABORADOR |
| dia_semana     | TINYINT | 0 a 6            |
| hora_inicio    | TIME    | Início           |
| hora_fim       | TIME    | Fim              |

## 5. SERVICO

Catálogo de serviços oferecidos.

| Campo           | Tipo          | Observação       |
| --------------- | ------------- | ---------------- |
| id              | BIGINT        | PK               |
| nome            | VARCHAR(150)  | Nome             |
| descricao       | TEXT          | Descrição        |
| valor           | DECIMAL(10,2) | Preço            |
| duracao_minutos | INT           | Duração estimada |
| status          | BOOLEAN       | Ativo/Inativo    |

## 6. SERVICO_PRODUTO

Relacionamento entre serviços e produtos utilizados.

Permite que um serviço utilize vários produtos e que um produto seja utilizado em vários serviços.

| Campo      | Tipo          | Observação           |
| ---------- | ------------- | -------------------- |
| id         | BIGINT        | PK                   |
| id_servico | BIGINT        | FK → SERVICO         |
| id_produto | BIGINT        | FK → PRODUTO         |
| quantidade | DECIMAL(10,3) | Quantidade consumida |

## 7. PRODUTO

Cadastro de produtos comercializados ou utilizados nos serviços.

| Campo       | Tipo          | Observação     |
| ----------- | ------------- | -------------- |
| id          | BIGINT        | PK             |
| nome        | VARCHAR(150)  | Nome           |
| descricao   | TEXT          | Descrição      |
| valor_custo | DECIMAL(10,2) | Custo          |
| valor_venda | DECIMAL(10,2) | Preço de venda |
| qntd        | DECIMAL(10,3) | Estoque atual  |
| qntd_min    | DECIMAL(10,3) | Estoque mínimo |
| status      | BOOLEAN       | Ativo/Inativo  |

## 8. AGENDAMENTO

Gerenciamento dos agendamentos.

| Campo          | Tipo          | Observação          |
| -------------- | ------------- | ------------------- |
| id             | BIGINT        | PK                  |
| id_cliente     | BIGINT        | FK → CLIENTE        |
| id_colaborador | BIGINT        | FK → COLABORADOR    |
| id_servico     | BIGINT        | FK → SERVICO        |
| data_efetuado  | DATETIME      | Criação             |
| data_marcada   | DATE          | Data do atendimento |
| hora_inicio    | TIME          | Horário inicial     |
| hora_fim       | TIME          | Horário final       |
| valor_previsto | DECIMAL(10,2) | Valor previsto      |
| status         | ENUM          | Situação            |
| observacao     | TEXT          | Observações         |

Status sugeridos: Pendente, Confirmado, Em andamento, Concluído, Cancelado e Não compareceu.

## 9. VENDA

Informações gerais da venda.

| Campo          | Tipo          | Observação             |
| -------------- | ------------- | ---------------------- |
| id             | BIGINT        | PK                     |
| id_cliente     | BIGINT        | FK → CLIENTE           |
| id_agendamento | BIGINT        | FK → AGENDAMENTO, NULL |
| id_colaborador | BIGINT        | FK → COLABORADOR       |
| valor_total    | DECIMAL(10,2) | Soma dos itens         |
| valor_desconto | DECIMAL(10,2) | Desconto               |
| valor_final    | DECIMAL(10,2) | Total final            |
| data           | DATETIME      | Data da venda          |
| status         | ENUM          | Situação da venda      |

## 10. VENDA_ITEM

Produtos e serviços que compõem uma venda.

| Campo          | Tipo          | Observação             |
| -------------- | ------------- | ---------------------- |
| id             | BIGINT        | PK                     |
| id_venda       | BIGINT        | FK → VENDA             |
| tipo           | ENUM          | PRODUTO / SERVICO      |
| id_produto     | BIGINT        | FK → PRODUTO, NULL     |
| id_servico     | BIGINT        | FK → SERVICO, NULL     |
| id_colaborador | BIGINT        | FK → COLABORADOR, NULL |
| quantidade     | DECIMAL(10,3) | Quantidade             |
| valor_unitario | DECIMAL(10,2) | Preço unitário         |
| valor_desconto | DECIMAL(10,2) | Desconto               |
| valor_total    | DECIMAL(10,2) | Total do item          |

Essa tabela permite que uma única venda tenha vários serviços e produtos, inclusive executados ou vendidos por colaboradores diferentes.

## 11. VENDA_PAGAMENTO

Controle das formas de pagamento.

| Campo           | Tipo          | Observação                     |
| --------------- | ------------- | ------------------------------ |
| id              | BIGINT        | PK                             |
| id_venda        | BIGINT        | FK → VENDA                     |
| forma_pagamento | ENUM          | Dinheiro, PIX, Crédito, Débito |
| valor           | DECIMAL(10,2) | Valor pago                     |
| data_pagamento  | DATETIME      | Data                           |
| status          | ENUM          | Pendente, Pago, Estornado      |

## 12. ESTOQUE_MOVIMENTACAO

Histórico de entradas e saídas de produtos.

| Campo         | Tipo          | Observação               |
| ------------- | ------------- | ------------------------ |
| id            | BIGINT        | PK                       |
| id_produto    | BIGINT        | FK → PRODUTO             |
| id_venda_item | BIGINT        | FK → VENDA_ITEM, NULL    |
| tipo          | ENUM          | ENTRADA / SAIDA / AJUSTE |
| quantidade    | DECIMAL(10,3) | Quantidade movimentada   |
| motivo        | VARCHAR(255)  | Justificativa            |
| data          | DATETIME      | Data da movimentação     |

## 13. POS_VENDA

Avaliação e feedback do cliente.

| Campo      | Tipo     | Observação        |
| ---------- | -------- | ----------------- |
| id         | BIGINT   | PK                |
| id_venda   | BIGINT   | FK → VENDA        |
| avaliacao  | TINYINT  | Nota de 1 a 5     |
| comentario | TEXT     | Comentário        |
| data       | DATETIME | Data da avaliação |

# Fluxo de funcionamento

## Operação do estabelecimento

PESSOA

Cadastro centralizado

CLIENTE

COLABORADOR

AGENDAMENTO

Serviço + profissional + horário

VENDA

Itens, serviços, produtos e descontos

PAGAMENTO

ESTOQUE

PÓS-VENDA

Avaliações e feedback

## Observações técnicas importantes

1. Integridade: `CLIENTE.id_pessoa` e `COLABORADOR.id_pessoa` devem ser chaves primárias e estrangeiras simultaneamente.
2. Vendas: os valores e preços devem ser armazenados como snapshots nos itens, para preservar o histórico mesmo que o preço do catálogo mude.
3. Estoque: serviços que consomem produtos devem gerar movimentações de saída quando o atendimento for efetivamente concluído.
4. Agendamentos: a disponibilidade deve considerar conflitos de horários, duração do serviço e expediente do colaborador.
5. Pagamentos: uma venda pode ter vários pagamentos, permitindo divisão entre PIX, dinheiro e cartão.
6. Venda e agendamento: o relacionamento deve permitir vendas sem agendamento, como vendas avulsas de produtos.

Minha recomendação: utilizar MySQL com InnoDB, chaves estrangeiras, índices e transações para garantir a consistência dos registros.