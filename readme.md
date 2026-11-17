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

# Relacionamentos do banco

\#chatgpt-mermaid-\_r_bi\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_bi\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bi\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_bi\_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_bi\_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_bi\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_bi\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_bi\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_bi\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_bi\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_bi\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_bi\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_bi\_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_bi\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_bi\_ p{margin:0;}#chatgpt-mermaid-\_r_bi\_ .entityBox{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);}#chatgpt-mermaid-\_r_bi\_ .relationshipLabelBox{fill:rgb(48, 48, 48);opacity:0.7;background-color:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_bi\_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-\_r_bi\_ .labelBkg{background-color:rgba(48, 48, 48, 0.5);}#chatgpt-mermaid-\_r_bi\_ .edgeLabel{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_bi\_ .edgeLabel .label rect{fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_bi\_ .edgeLabel .label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_bi\_ .edgeLabel .label{fill:rgb(31, 78, 148);font-size:14px;}#chatgpt-mermaid-\_r_bi\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_bi\_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-\_r_bi\_ .node rect,#chatgpt-mermaid-\_r_bi\_ .node circle,#chatgpt-mermaid-\_r_bi\_ .node ellipse,#chatgpt-mermaid-\_r_bi\_ .node polygon{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-\_r_bi\_ .relationshipLine{stroke:rgb(175, 175, 175);stroke-width:1px;fill:none;}#chatgpt-mermaid-\_r_bi\_ .marker{fill:none!important;stroke:rgb(175, 175, 175)!important;stroke-width:1;}#chatgpt-mermaid-\_r_bi\_ [data-look=neo].labelBkg{background-color:rgba(48, 48, 48, 0.5);}#chatgpt-mermaid-\_r_bi\_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-\_r_bi\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_bi\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_bi\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_bi\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bi\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_bi\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_bi\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_bi\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bi\_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-\_r_bi\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_bi\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bi\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_bi\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_bi\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bi\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_bi\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_bi\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}PESSOACLIENTECOLABORADORAGENDAMENTOSERVICOCOLABORADOR_DISPONIBILIDADESERVICO_PRODUTOPRODUTOVENDAVENDA_ITEMVENDA_PAGAMENTOESTOQUE_MOVIMENTACAOPOS_VENDApossuipossuirealizaatendecontratadopossuiutilizautilizadorealizaregistraoriginapossuiexecutacomercializadocontratadorecebemovimentaoriginaavaliada

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