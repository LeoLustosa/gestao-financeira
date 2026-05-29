const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function getDbConnection() {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
}

async function initDatabase() {
  const db = await getDbConnection();

  // 1. Cria a Tabela de Utilizadores
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  // 2. Cria a Tabela de Categorias
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      displayName TEXT NOT NULL,
      icon TEXT,
      background TEXT,
      isIncome INTEGER NOT NULL
    );
  `);

  // 3. Cria a Tabela de Transações
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      value REAL NOT NULL,
      date TEXT NOT NULL,
      categoryId TEXT,
      userId TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  // 4. Cria a Tabela de Cartões de Crédito
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      limit_amount REAL NOT NULL,
      used_amount REAL DEFAULT 0,
      network TEXT,
      color TEXT,
      userId TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  // 5. Cria a Tabela de Metas/Objetivos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      color TEXT,
      userId TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  // 6. Cria a Tabela de Orçamentos (Budgets)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      limit_amount REAL NOT NULL,
      spent_amount REAL DEFAULT 0,
      color TEXT,
      userId TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  // Seed das Categorias Padrão
  const count = await db.get('SELECT COUNT(*) as count FROM categories');
  if (count.count === 0) {
    await db.exec(`
      INSERT INTO categories (id, name, displayName, icon, background, isIncome) VALUES
      ('income', 'income', 'Receita', 'arrow-upward', '#C8E6C9', 1),
      ('food', 'food', 'Alimentação', 'restaurant', '#FFCDD2', 0),
      ('transport', 'transport', 'Transporte', 'directions-car', '#BBDEFB', 0),
      ('leisure', 'leisure', 'Lazer', 'sports-esports', '#E1BEE7', 0),
      ('others', 'others', 'Outros', 'category', '#D7CCC8', 0);
    `);
    console.log('Banco de dados inicializado com as 5 categorias padrão!');
  }

  return db;
}

module.exports = { getDbConnection, initDatabase };
