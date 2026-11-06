const express = require('express');
const cors = require('cors');

const pessoasRoutes = require('./routes/pessoas');
const clientesRoutes = require('./routes/clientes');
const colaboradoresRoutes = require('./routes/colaboradores');
const servicosRoutes = require('./routes/servicos');
const produtosRoutes = require('./routes/produtos');
const agendamentosRoutes = require('./routes/agendamentos');
const vendasRoutes = require('./routes/vendas');
const estoqueRoutes = require('./routes/estoque');
const posVendaRoutes = require('./routes/posVenda');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/pessoas', pessoasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/colaboradores', colaboradoresRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/pos-venda', posVendaRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API GCE rodando com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
