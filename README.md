# 📊 FinApp - Sistema de Gestão Financeira Inteligente

Bem-vindo ao **FinApp**, uma aplicação móvel completa de controle e planejamento financeiro pessoal desenvolvida em **React Native (Expo)** no Frontend e **Node.js (Express + SQLite)** no Backend.

---

## 📁 Estrutura do Projeto

```
gestao-financeira/
├── backend/                    # Servidor Node.js + API RESTful
│   ├── server.js              # Servidor Express com rotas da API
│   ├── database.js            # Inicialização e conexão do SQLite
│   ├── seed.js                # Script para popular dados de teste
│   ├── package.json
│   └── database.sqlite        # Banco de dados (criado automaticamente)
│
├── frontend/
│   └── app/                   # Aplicação React Native (Expo)
│       ├── App.js             # Componente raiz
│       ├── screens/           # Telas da aplicação
│       ├── components/        # Componentes reutilizáveis
│       ├── services/          # Serviços (API, etc)
│       ├── package.json
│       └── app.json           # Config do Expo
│
├── postman/                   # Coleção de testes da API
├── README.md                  # Este arquivo
└── .gitignore
```

---

## 🚀 Setup Rápido (3 Passos)

### Pré-requisitos
- **Node.js** (v18+) e **npm**
- **Expo CLI** (instale com `npm install -g expo-cli`)
- Para testar no celular: **Expo Go** app instalado no seu dispositivo
- **Windows:** Use Git Bash ou PowerShell

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/LeoLustosa/gestao-financeira.git
cd gestao-financeira
```

### 2️⃣ Configurar e Rodar o Backend

Abra um **terminal/PowerShell** e execute:

```bash
cd backend
npm install
node seed.js
node server.js
```

Você verá:
```
✅ Dados gerados com sucesso!
Servidor rodando na porta http://localhost:3000
```

**O servidor fica rodando!** Deixe este terminal aberto e abra um novo para o frontend.

### 3️⃣ Configurar e Rodar o Frontend

Abra um **novo terminal** na pasta raiz:

```bash
cd frontend/app
npm install
npx expo start -c
```

**Opção A: Testar em Emulador Android**
- Pressione `a` no terminal para abrir o emulador

**Opção B: Testar em Telemóvel Físico**
1. Baixe o app **Expo Go** (iOS/Android)
2. Escaneie o QR Code que apareceu no terminal
3. ⚠️ **Importante:** Ambos (celular e PC) devem estar no **mesmo Wi-Fi**

**⚠️ Nota Importante (Celular Físico):**
- Edite `frontend/app/services/api.js`
- Substitua `baseURL` pelo IP local da sua máquina (ex: `http://192.168.1.100:3000`)
- Encontre o IP com: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux), procure por "IPv4 Address"


---

## 🔑 Credenciais de Teste

**Conta pré-carregada com 4 meses de histórico completo:**

```
📧 E-mail: professor@teste.com
🔑 Senha: 123456
```

---

## 💎 Funcionalidades Principais

### Dashboard Inteligente (Resumo)
- Saldo consolidado e histórico acumulado
- Filtro dinâmico por mês
- Modo privacidade (ocultar valores)
- Próximos vencimentos com alertas

### Extrato Detalhado
- Filtros por tipo (Todas, Receitas, Despesas)
- Gestão direta (editar/deletar com long press)
- Busca e segmentação por período

### Planejamento Avançado
- **Orçamentos:** Limite por categoria com barra de progresso
- **Metas de Poupança:** Rastreie seus objetivos financeiros
- **Cartões:** Gerencie múltiplos cartões de crédito
- **Customização:** Crie suas próprias categorias

### Central de Notificações
- Alertas de gastos excessivos
- Categorização por severidade
- Ações em lote

---

## 🛠️ Tecnologias Utilizadas

**Backend:**
- Node.js + Express.js
- SQLite (banco de dados relacional)
- Zod (validação de dados)
- CORS habilitado

**Frontend:**
- React Native + Expo SDK 54
- React Navigation (bottom tabs + stack)
- Axios (requisições HTTP)
- Lucide React Native (ícones)
- date-fns (manipulação de datas)

---

## 📋 Comandos Úteis

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Rodar com hot-reload
npm run dev

# Executar seed (dados de teste)
node seed.js

# Iniciar servidor
node server.js
```

### Frontend

```bash
cd frontend/app

# Instalar dependências
npm install

# Iniciar com cache limpo
npx expo start -c

# Rodar direto no Android
npx expo start --android

# Rodar direto no iOS
npx expo start --ios
```

---

## 🐛 Troubleshooting

### Backend não inicia?

```bash
# 1. Verifique se a porta 3000 está em uso
# Windows:
netstat -ano | findstr :3000

# 2. Mate o processo (Windows):
taskkill /PID <PID> /F

# 3. Limpe cache:
npm cache clean --force

# 4. Reinstale dependências:
rm -r node_modules package-lock.json
npm install
```

### "Cannot find module" no frontend?

```bash
# Limpe e reinstale:
cd frontend/app
rm -rf node_modules package-lock.json
npm install
```

### Expo não inicializa?

```bash
# Limpe cache do Expo:
npx expo start -c

# Se ainda não funcionar:
npm uninstall -g expo-cli
npm install -g expo-cli@latest
```

### "Conexão recusada" ao testar API no celular?

**Se usar emulador Android:**
- A URL já está correta: `http://10.0.2.2:3000`

**Se usar celular físico:**
- Edite `frontend/app/services/api.js`
- Encontre o IP da sua máquina:
  ```bash
  # Windows:
  ipconfig | findstr "IPv4"
  
  # Mac/Linux:
  ifconfig | grep "inet "
  ```
- Substitua na linha 9 (ex: `http://192.168.1.100:3000`)
- Certifique-se que ambos estão no **mesmo Wi-Fi**

### Seed.js não gera dados?

```bash
# Delete o banco de dados antigo:
cd backend
rm database.sqlite

# Execute seed novamente:
node seed.js

# Inicie o servidor:
node server.js
```

### "Permission denied" ou "Device busy"?

- Feche todos os terminais e IDEs
- Reinicie o Windows
- Tente novamente

---

## 📚 Documentação da API

A API está totalmente funcional em `http://localhost:3000`. Endpoints principais:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/register` | Criar nova conta |
| POST | `/login` | Login de usuário |
| GET | `/transactions` | Listar transações do usuário |
| POST | `/transactions` | Criar transação |
| GET | `/categories` | Listar categorias |
| POST | `/categories` | Criar categoria |
| GET | `/budgets` | Listar orçamentos |
| POST | `/budgets` | Criar orçamento |
| GET | `/goals` | Listar metas |
| POST | `/goals` | Criar meta |
| GET | `/cards` | Listar cartões |
| POST | `/cards` | Adicionar cartão |

---

## ✅ Verificação Final

- [x] Backend rodando em http://localhost:3000
- [x] Frontend rodando via Expo
- [x] Seed de dados executado
- [x] Login funcionando com `professor@teste.com / 123456`
- [x] Transações, orçamentos e metas visíveis no dashboard

---

## 📝 Notas Importantes

1. **Banco de dados:** SQLite armazenado em `backend/database.sqlite` (local)
2. **Segurança:** Este é um projeto educacional. Senhas não são criptografadas
3. **Dados de teste:** Execute `seed.js` sempre que desejar resetar os dados
4. **Modo desenvolvimento:** Todos os logs estão habilitados para debugging

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os pré-requisitos (Node.js, Expo)
2. Limpe cache: `npm cache clean --force`
3. Reinstale dependências: `rm -rf node_modules && npm install`
4. Consulte os logs no terminal para mensagens de erro detalhadas

---

**Desenvolvido com ❤️ para avaliação de Gestão Financeira**
