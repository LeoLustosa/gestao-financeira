const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { z } = require('zod');
const { initDatabase, getDbConnection } = require('./database');
const app = express();
app.use(cors());
app.use(express.json());

// --- Rota 1: Health-check ---
app.get('/', (req, res) => {
  res.json({ ok: true, name: "gestao-financeira-api" });
});

// --- SEGURANÇA (Regras do Zod) ---
const categorySchema = z.object({
  name: z.string(),
  displayName: z.string(),
  icon: z.string(),
  background: z.string(),
  isIncome: z.boolean()
});

// Requisito 10: Validação de transações com Zod
const transactionSchema = z.object({
  description: z.string().min(1, "A descrição não pode estar vazia"),
  value: z.number().positive("O valor deve ser positivo"),
  date: z.string(),
  categoryId: z.string(), // <--- A VÍRGULA QUE FALTAVA ESTAVA AQUI!
  userId: z.string()      // <--- Agora exige o ID do dono!
});

// Requisito: Validação de Utilizadores
const userSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 letras"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(4, "A senha deve ter pelo menos 4 caracteres")
});

// --- ROTAS DE CATEGORIAS ---
app.get('/categories', async (req, res) => {
  const db = await getDbConnection();
  const categories = await db.all('SELECT * FROM categories');
  res.json(categories.map(cat => ({ ...cat, isIncome: cat.isIncome === 1 })));
});

app.post('/categories', async (req, res) => {
  try {
    const data = categorySchema.parse(req.body);
    const db = await getDbConnection();
    const newId = crypto.randomUUID();
    const isIncomeInt = data.isIncome ? 1 : 0;
    await db.run(
      'INSERT INTO categories (id, name, displayName, icon, background, isIncome) VALUES (?, ?, ?, ?, ?, ?)',
      [newId, data.name, data.displayName, data.icon, data.background, isIncomeInt]
    );
    res.status(201).json({ id: newId, ...data });
  } catch (error) {
    res.status(400).json({ error: "Dados inválidos", details: error.errors });
  }
});

app.put('/categories/:id', async (req, res) => {
  const { displayName } = req.body; 
  if (!displayName) return res.status(400).json({ error: "displayName é obrigatório" });
  const db = await getDbConnection();
  await db.run('UPDATE categories SET displayName = ? WHERE id = ?', [displayName, req.params.id]);
  res.json({ message: "Categoria atualizada com sucesso!" });
});

app.delete('/categories/:id', async (req, res) => {
  const id = req.params.id;
  const defaultCategories = ['income', 'food', 'transport', 'leisure', 'others'];
  if (defaultCategories.includes(id)) {
    return res.status(400).json({ error: "Categorias padrão não podem ser excluídas" });
  }
  const db = await getDbConnection();
  await db.run('DELETE FROM categories WHERE id = ?', [id]);
  res.status(204).send();
});

// --- ROTAS DE TRANSAÇÕES ---

// Requisito 8: Listar transações (AGORA FILTRA POR UTILIZADOR!)
app.get('/transactions', async (req, res) => {
  const { userId } = req.query; // Pega o ID que vem na URL do celular
  
  if (!userId) {
    return res.status(400).json({ error: "É necessário informar o utilizador." });
  }

  const db = await getDbConnection();
  
  // CORRIGIDO: Busca apenas as transações deste utilizador específico
  const transactions = await db.all('SELECT * FROM transactions WHERE userId = ?', [userId]);
  const categories = await db.all('SELECT * FROM categories');

  const formattedTransactions = transactions.map(t => {
    const cat = categories.find(c => c.id === t.categoryId);
    return {
      ...t,
      category: cat ? { ...cat, isIncome: cat.isIncome === 1 } : null
    };
  });
  
  res.json(formattedTransactions);
});

// Requisito 7: Criar transação (AGORA GRAVA O DONO NO BANCO!)
app.post('/transactions', async (req, res) => {
  try {
    const data = transactionSchema.parse(req.body);
    const db = await getDbConnection();
    
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [data.categoryId]);
    if (!category) {
      return res.status(400).json({ error: "Categoria não encontrada" });
    }

    const newId = crypto.randomUUID();
    
    // CORRIGIDO: Agora tem 6 pontos de interrogação e salva o data.userId
    await db.run(`
      INSERT INTO transactions (id, description, value, date, categoryId, userId)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [newId, data.description, data.value, data.date, data.categoryId, data.userId]);

    res.status(201).json({
      id: newId,
      description: data.description,
      value: data.value,
      date: data.date,
      categoryId: data.categoryId,
      userId: data.userId,
      category: {
        ...category,
        isIncome: category.isIncome === 1
      }
    });
  } catch (error) {
    res.status(400).json({ error: "Dados inválidos", details: error.errors });
  }
});

// Requisito 9: Excluir transação
app.delete('/transactions/:id', async (req, res) => {
  const db = await getDbConnection();
  await db.run('DELETE FROM transactions WHERE id = ?', [req.params.id]);
  res.status(204).send();
});

// --- ROTAS DE UTILIZADORES (AUTENTICAÇÃO) ---

app.post('/register', async (req, res) => {
  try {
    const data = userSchema.parse(req.body);
    const db = await getDbConnection();
    
    const userExists = await db.get('SELECT * FROM users WHERE email = ?', [data.email]);
    if (userExists) {
      return res.status(400).json({ error: "Este e-mail já está registado." });
    }

    const newId = crypto.randomUUID();
    await db.run(`
      INSERT INTO users (id, name, email, password)
      VALUES (?, ?, ?, ?)
    `, [newId, data.name, data.email, data.password]);

    res.status(201).json({ message: "Utilizador criado com sucesso!", id: newId, name: data.name });
  } catch (error) {
    res.status(400).json({ error: "Dados inválidos", details: error.errors || error });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e palavra-passe são obrigatórios." });
  }

  const db = await getDbConnection();
  const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas! Verifique o e-mail e a palavra-passe." });
  }

  res.status(200).json({
    message: "Login bem-sucedido!",
    user: { id: user.id, name: user.name, email: user.email }
  });
});
// --- ROTAS DE CARTÕES DE CRÉDITO ---
app.get('/cards', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId obrigatório." });
  const db = await getDbConnection();
  const cards = await db.all('SELECT * FROM cards WHERE userId = ?', [userId]);
  res.json(cards);
});

app.post('/cards', async (req, res) => {
  try {
    const { name, limit_amount, network, color, userId } = req.body;
    const db = await getDbConnection();
    const newId = crypto.randomUUID();
    
    await db.run(`
      INSERT INTO cards (id, name, limit_amount, used_amount, network, color, userId)
      VALUES (?, ?, ?, 0, ?, ?, ?)
    `, [newId, name, limit_amount, network, color, userId]);
    
    res.status(201).json({ message: "Cartão adicionado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar cartão." });
  }
});

// --- ROTAS DE METAS ---
app.get('/goals', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId obrigatório." });
  const db = await getDbConnection();
  const goals = await db.all('SELECT * FROM goals WHERE userId = ?', [userId]);
  res.json(goals);
});

app.post('/goals', async (req, res) => {
  try {
    const { name, target_amount, current_amount, color, userId } = req.body;
    const db = await getDbConnection();
    const newId = crypto.randomUUID();
    
    await db.run(`
      INSERT INTO goals (id, name, target_amount, current_amount, color, userId)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [newId, name, target_amount, current_amount || 0, color, userId]);
    
    res.status(201).json({ message: "Meta criada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar meta." });
  }
});
// --- ROTAS DE ORÇAMENTOS ---
app.get('/budgets', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId obrigatório." });
  
  const db = await getDbConnection();
  
  // 1. Busca todos os orçamentos do usuário
  const budgets = await db.all('SELECT * FROM budgets WHERE userId = ?', [userId]);
  
  // 2. Descobre o mês e ano atual para filtrar os gastos
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0'); // ex: "05"
  const currentYear = String(now.getFullYear()); // ex: "2026"
  const monthPattern = `${currentYear}-${currentMonth}-%`; // Filtro SQL para o mês ex: "2026-05-%"

  // 3. Para cada orçamento, calcula o quanto já foi gasto no mês real
  const updatedBudgets = await Promise.all(budgets.map(async (budget) => {
    // Soma os valores das transações que NÃO são receitas, pertencem ao usuário e combinam com a categoria do orçamento
    const result = await db.get(`
      SELECT SUM(t.value) as total_spent 
      FROM transactions t
      JOIN categories c ON t.categoryId = c.id
      WHERE t.userId = ? 
        AND c.displayName LIKE ? 
        AND c.isIncome = 0
        AND t.date LIKE ?
    `, [userId, budget.category, monthPattern]);

    return {
      ...budget,
      spent_amount: result.total_spent || 0 // Se for nulo, vira 0
    };
  }));

  res.json(updatedBudgets);
});
app.post('/budgets', async (req, res) => {
  try {
    const { category, limit_amount, color, userId } = req.body;
    const db = await getDbConnection();
    const newId = crypto.randomUUID();

    await db.run(`
      INSERT INTO budgets (id, category, limit_amount, spent_amount, color, userId)
      VALUES (?, ?, ?, 0, ?, ?)
    `, [newId, category, limit_amount, color, userId]);

    res.status(201).json({ message: "Orçamento criado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar orçamento." });
  }
});
// --- ROTAS DE PERFIL DO UTILIZADOR ---

// 1. Buscar os dados do utilizador
app.get('/users/:id', async (req, res) => {
  const db = await getDbConnection();
  // Busca o utilizador, mas NUNCA devolve a password por segurança
  const user = await db.get('SELECT id, name, email FROM users WHERE id = ?', [req.params.id]);
  
  if (!user) return res.status(404).json({ error: "Utilizador não encontrado." });
  res.json(user);
});

// 2. Atualizar o perfil do utilizador
app.put('/users/:id', async (req, res) => {
  const { name, password } = req.body;
  const db = await getDbConnection();
  
  try {
    if (password && password.trim() !== '') {
      // Se a pessoa digitou uma password nova, atualizamos tudo
      await db.run('UPDATE users SET name = ?, password = ? WHERE id = ?', [name, password, req.params.id]);
    } else {
      // Se a password veio vazia, atualizamos apenas o nome
      await db.run('UPDATE users SET name = ? WHERE id = ?', [name, req.params.id]);
    }
    res.json({ message: "Perfil atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar o perfil." });
  }
});

// --- LIGANDO O SERVIDOR ---
const PORT = 3000;
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
  });
});