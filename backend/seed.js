const { getDbConnection } = require('./database');
const crypto = require('crypto');

async function runSeed() {
  const db = await getDbConnection();

  console.log("🌱 Iniciando o plantio massivo de dados de teste...");

  // 1. Verificar se o Professor já existe e limpar dados antigos
  const emailProf = 'professor@teste.com';
  const userExist = await db.get('SELECT id FROM users WHERE email = ?', [emailProf]);

  let profId;
  if (userExist) {
    profId = userExist.id;
    console.log("🔄 Limpando histórico antigo do professor...");
    await db.run('DELETE FROM transactions WHERE userId = ?', [profId]);
    await db.run('DELETE FROM cards WHERE userId = ?', [profId]);
    await db.run('DELETE FROM budgets WHERE userId = ?', [profId]);
    await db.run('DELETE FROM goals WHERE userId = ?', [profId]);
  } else {
    profId = crypto.randomUUID();
    await db.run(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [profId, 'Professor Avaliador', emailProf, '123456']
    );
  }

  // 2. Criar Categorias Dinâmicas
  const categorias = [
    { id: crypto.randomUUID(), name: 'salario_prof', displayName: 'Salário', icon: 'Briefcase', bg: '#10B981', isIncome: 1 },
    { id: crypto.randomUUID(), name: 'moradia_prof', displayName: 'Moradia', icon: 'Home', bg: '#64748B', isIncome: 0 },
    { id: crypto.randomUUID(), name: 'mercado_prof', displayName: 'Mercado', icon: 'ShoppingCart', bg: '#F59E0B', isIncome: 0 },
    { id: crypto.randomUUID(), name: 'lazer_prof', displayName: 'Lazer', icon: 'Coffee', bg: '#8B5CF6', isIncome: 0 },
    { id: crypto.randomUUID(), name: 'transporte_prof', displayName: 'Transporte', icon: 'Car', bg: '#3B82F6', isIncome: 0 },
    { id: crypto.randomUUID(), name: 'assinaturas_prof', displayName: 'Assinaturas', icon: 'Monitor', bg: '#EC4899', isIncome: 0 }
  ];

  for (const cat of categorias) {
    await db.run(
      'INSERT INTO categories (id, name, displayName, icon, background, isIncome) VALUES (?, ?, ?, ?, ?, ?)',
      [cat.id, cat.name, cat.displayName, cat.icon, cat.bg, cat.isIncome]
    );
  }

  // 3. Gerar Histórico de 4 Meses (Março a Junho de 2026)
  const ano = 2026;
  const meses = ['03', '04', '05', '06'];
  const transacoes = [];

  for (const mes of meses) {
    // Receitas
    transacoes.push({ desc: 'Salário Universidade', valor: 8500.00, data: `${ano}-${mes}-05`, cat: categorias[0].id });

    // Despesas Fixas / Recorrentes
    transacoes.push({ desc: 'Aluguel', valor: 2200.00, data: `${ano}-${mes}-10`, cat: categorias[1].id });
    transacoes.push({ desc: 'Internet Fibra', valor: 119.90, data: `${ano}-${mes}-15`, cat: categorias[1].id });
    transacoes.push({ desc: 'Netflix Premium', valor: 55.90, data: `${ano}-${mes}-20`, cat: categorias[5].id });
    transacoes.push({ desc: 'Spotify', valor: 21.90, data: `${ano}-${mes}-21`, cat: categorias[5].id });
    transacoes.push({ desc: 'Seguro do Carro', valor: 180.00, data: `${ano}-${mes}-25`, cat: categorias[4].id });

    // Despesas Variáveis (Oscilam um pouco para dar realismo)
    const variacao = Math.random() * 100;
    transacoes.push({ desc: 'Supermercado', valor: 650.00 + variacao, data: `${ano}-${mes}-08`, cat: categorias[2].id });
    transacoes.push({ desc: 'Uber', valor: 35.00 + (variacao/2), data: `${ano}-${mes}-12`, cat: categorias[4].id });
    transacoes.push({ desc: 'Jantar Restaurante', valor: 140.00, data: `${ano}-${mes}-14`, cat: categorias[3].id });
    transacoes.push({ desc: 'Farmácia', valor: 85.50, data: `${ano}-${mes}-18`, cat: categorias[1].id });
  }

  // Adicionar contas pontuais para "Próximos Vencimentos" (Fim de Maio)
  transacoes.push({ desc: 'Conta de Luz', valor: 185.40, data: `2026-05-29`, cat: categorias[1].id });
  transacoes.push({ desc: 'Cartão de Crédito', valor: 1450.00, data: `2026-05-30`, cat: categorias[1].id });

  for (const tx of transacoes) {
    await db.run(
      'INSERT INTO transactions (id, description, value, date, categoryId, userId) VALUES (?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), tx.desc, tx.valor, tx.data, tx.cat, profId]
    );
  }

  // 4. Inserir Cartões, Orçamentos e Metas
  await db.run('INSERT INTO cards (id, name, limit_amount, used_amount, network, color, userId) VALUES (?, ?, ?, ?, ?, ?, ?)', [crypto.randomUUID(), 'Nubank Platinum', 5000, 1450.00, 'Mastercard', '#8B5CF6', profId]);
  await db.run('INSERT INTO cards (id, name, limit_amount, used_amount, network, color, userId) VALUES (?, ?, ?, ?, ?, ?, ?)', [crypto.randomUUID(), 'Itaú Click', 3000, 320.00, 'Visa', '#F97316', profId]);

  await db.run('INSERT INTO budgets (id, category, limit_amount, spent_amount, color, userId) VALUES (?, ?, ?, ?, ?, ?)', [crypto.randomUUID(), 'Mercado', 1200, 0, '#F59E0B', profId]);
  await db.run('INSERT INTO budgets (id, category, limit_amount, spent_amount, color, userId) VALUES (?, ?, ?, ?, ?, ?)', [crypto.randomUUID(), 'Lazer', 500, 0, '#8B5CF6', profId]);

  await db.run('INSERT INTO goals (id, name, target_amount, current_amount, color, userId) VALUES (?, ?, ?, ?, ?, ?)', [crypto.randomUUID(), 'Reserva de Emergência', 20000, 8500, '#10B981', profId]);
  await db.run('INSERT INTO goals (id, name, target_amount, current_amount, color, userId) VALUES (?, ?, ?, ?, ?, ?)', [crypto.randomUUID(), 'Viagem para Bahia', 4500, 1200, '#3B82F6', profId]);

  console.log("✅ Dados gerados com sucesso! O professor tem agora 4 meses de histórico riquíssimo.");
}

runSeed();
