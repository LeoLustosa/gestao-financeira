# 📊 FinApp - Sistema de Gestão Financeira Inteligente

Bem-vindo ao **FinApp**, uma aplicação móvel completa de controlo e planeamento financeiro pessoal desenvolvida em **React Native (Expo Go)** no Frontend e **Node.js (Express + SQLite)** no Backend.

Este repositório apresenta a solução estruturada para a avaliação prática da unidade curricular, contendo validações robustas com **Zod**, banco de dados relacional e sincronização em tempo real de estados.

---

## 🎯 Guia Rápido de Avaliação (Credenciais do Professor)

Para proporcionar uma experiência de correção imediata e rica em detalhes visuais, criámos um **mecanismo de "Seed" automático**. Ao rodar o semeador de dados, a conta do avaliador será recheada com **4 meses de histórico financeiro completo (Março, Abril, Maio e Junho de 2026)**, incluindo receitas, despesas recorrentes (Netflix, Spotify, Aluguer), despesas variáveis, cartões cadastrados, metas e orçamentos em andamento.

### 🔑 Dados de Acesso Pré-carregados:
* ✉️ **E-mail:** `professor@teste.com`
* 🔑 **Palavra-passe (Senha):** `123456`

---

## ⚙️ Como Executar o Projeto Passo a Passo (Visão do Avaliador)

Como este projeto está a ser avaliado através de um **Pull Request**, siga as instruções abaixo para garantir que está a testar a ramificação (*branch*) correta com todas as implementações finais.

### 1. Clonar e Aceder à Branch do PR
Abra o terminal no seu computador e execute os seguintes comandos:
```bash
# Clone o repositório (substitua pelo link caso ainda não o tenha feito)
git clone [https://github.com/seu-usuario/gestao-financeira.git](https://github.com/seu-usuario/gestao-financeira.git)

# Aceda à pasta do projeto
cd gestao-financeira

# Baixe todas as branches e mude para a branch específica deste Pull Request
git fetch origin
git checkout feature/dados-reais-e-notificacoes
2. Configurar e Iniciar o Servidor (Backend)
O backend gerencia o banco de dados SQLite local e expõe as rotas RESTful para a aplicação.

Abra um terminal e navegue até à pasta raiz do servidor.

Instale todos os pacotes necessários:

Bash
npm install
Executar a Carga de Dados (Seed): Instale os dados simulados do professor rodando o script semeador:

Bash
node seed.js
(Deverá ver a mensagem de sucesso: ✅ Dados gerados com sucesso! O professor tem agora 4 meses de histórico riquíssimo.)

Inicie o servidor em modo de desenvolvimento:

Bash
node server.js
(O servidor ficará ativo em: http://localhost:3000)

3. Configurar e Iniciar o Aplicativo (Frontend)
O frontend foi otimizado para rodar de forma nativa no seu telemóvel (celular) físico ou emulador através do Expo Go.

Abra um segundo terminal e navegue até à pasta do aplicativo móvel.

Instale as dependências do ecossistema React Native:

Bash
npm install
🌐 Configuração Crucial de IP (Rede Local):
Para que o telemóvel físico consiga comunicar com o servidor rodando no seu computador, abra o ficheiro services/api.js no VS Code e ajuste a constante baseURL:

Se testar em Telemóvel Físico (Expo Go): Substitua pelo IP IPv4 local da sua máquina (ex: http://192.168.1.XX:3000). Ambos devem estar no mesmo Wi-Fi.

Se testar em Emulador Android: Descomente a linha correspondente que aponta para o IP padrão do emulador: http://10.0.2.2:3000.

Execute o Metro Bundler limpando o cache para evitar conflitos:

Bash
npx expo start -c
Escaneie o QR Code impresso no terminal com a câmara do seu dispositivo (iOS) ou pelo app Expo Go (Android).

💎 Funcionalidades em Destaque na Avaliação
Ao navegar na aplicação utilizando a conta professor@teste.com, atente para as seguintes regras de negócio implementadas com rigor técnico:

1. Dashboard Inteligente (ResumoScreen)
Cálculo de Saldos Consolidado: O saldo total reflete o histórico global acumulado na base de dados, enquanto os blocos de "Receitas" e "Despesas" mudam dinamicamente com base no mês selecionado no topo do ecrã.

Próximos Vencimentos Ativos: Varre a tabela de transações procurando despesas do mês selecionado que vencem em datas iguais ou superiores à atual, exibindo alertas visuais detalhados com ícones de calendário.

Modo de Privacidade: O ícone do olho no topo oculta/exibe valores monetários de forma reativa em toda a interface utilizando controle de estados locais.

2. Extrato Detalhado (TodasDespesasScreen)
Filtros por Segmentação (Pills): Permite filtrar dinamicamente a listagem de registros em "Todas", apenas "Receitas" ou apenas "Despesas", acumulados dentro da janela temporal do mês em foco.

Gestão Direta (Long Press): Segurar o dedo sobre qualquer item do extrato dispara um menu contextual nativo que permite disparar a edição ou exclusão do registro na base de dados com atualização imediata em tela.

3. Planeamento Avançado (PlanningScreen)
Orçamentos Automatizados: Ao listar os orçamentos (ex: Mercado), o backend executa uma consulta relacional complexa agregando a soma de despesas reais feitas pelo usuário naquela categoria específica durante o mês em vigor. A barra de progresso altera de cor (Emerald para Rose) se os gastos ultrapassarem 90% do limite predefinido.

Ecrã de Novos Cadastros: Telas dedicadas para adicionar novos Cartões de Crédito, Metas de Poupança e Limites de Orçamento, todos devidamente tipados e persistidos no SQLite com ID único gerado de forma segura via Node crypto.randomUUID().

4. Customização Total de Categorias
Através da aba Perfil -> Categorias e Tags, o professor pode visualizar a listagem completa de categorias.

O utilizador tem a liberdade de criar novas categorias, estipulando se é uma Receita ou Despesa, selecionando o nome, uma cor da paleta e vinculando um ícone nativo da biblioteca lucide-react-native. A nova categoria fica disponível para uso imediato no formulário de lançamentos.

5. Central de Notificações Integrada
O clique no botão do Sino no cabeçalho redireciona para uma central rica com categorização de avisos em níveis de severidade (Success, Warning, Info). Conta com suporte a ações em lote para marcar como lidas ou limpar o painel.

🛠️ Tecnologias e Boas Práticas Empregadas
React Native & Expo (SDK 51): Interface nativa performática baseada em componentes funcionais e Hooks (useState, useEffect).

Navigation Context Component Isolation: Atualização limpa de dados ao navegar entre telas utilizando ouvintes de foco (navigation.addListener('focus')) para contornar problemas de cache de renderização.

Zod Validation Schema: Proteção de borda no backend contra payloads maliciosos ou nulos em transações, categorias e utilizadores.

Axios Interceptors Context: Isolamento das configurações de rede centralizadas em uma única instância reutilizável.

SQLite Relational Design: Tabelas normalizadas com restrições de chaves estrangeiras (FOREIGN KEY) assegurando integridade referencial robusta de dados de múltiplos usuários.