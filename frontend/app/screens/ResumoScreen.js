import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bell, Eye, EyeOff, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, AlertCircle, Calendar } from 'lucide-react-native';
import api from '../services/api';

export default function ResumoScreen({ route, navigation }) {
  const userName = route.params?.userName || 'Utilizador';
  const userId = route.params?.userId;
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Nomes dos meses para o filtro
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const mesAtual = meses[currentDate.getMonth()];
  const anoAtual = currentDate.getFullYear();

  function mudarMes(direcao) {
    const novaData = new Date(currentDate);
    novaData.setMonth(currentDate.getMonth() + direcao);
    setCurrentDate(novaData);
  }

  // Carrega os dados reais do banco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    loadData();
    return unsubscribe;
  }, [navigation, currentDate]);

  async function loadData() {
    setLoading(true);
    try {
      const response = await api.get(`/transactions?userId=${userId}`);
      setTransactions(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Função segura para formatar dinheiro no telemóvel
  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return 'R$ ' + num.toFixed(2)
      .replace('.', ',')
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  // --- CÁLCULOS FINANCEIROS (CORRIGIDOS PARA O NOVO FORMATO DE DATA) ---
  const totalBalance = transactions.reduce((acc, curr) => {
    return curr.category?.isIncome ? acc + curr.value : acc - curr.value;
  }, 0);

  // 1. Filtra as transações do mês usando objetos Date para ser mais seguro
  const transacoesDoMes = transactions.filter(t => {
    if (!t.date) return false;
    // O backend agora envia 'YYYY-MM-DD' de forma limpa.
    const dateObj = new Date(t.date);
    return dateObj.getFullYear() === anoAtual && dateObj.getMonth() === currentDate.getMonth();
  });

  // 2. Receitas e Despesas
  let totalIncome = 0;
  let totalExpense = 0;
  transacoesDoMes.forEach(t => {
    if (t.category?.isIncome) totalIncome += t.value;
    else totalExpense += t.value;
  });

  // 3. Próximos Vencimentos (Apenas despesas futuras do mês atual)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas os dias
  
  const proximosVencimentos = transacoesDoMes
    .filter(t => {
      if (t.category?.isIncome) return false; // Só despesas
      const dataTransacao = new Date(t.date);
      dataTransacao.setHours(0,0,0,0);
      // É próximo vencimento SE for hoje ou no futuro (e já sabemos que é deste mês pelo filtro acima)
      return dataTransacao >= hoje;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)) // Ordena pela data
    .slice(0, 2); 

  // Pegar a inicial do nome para o Avatar
  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Função para extrair o dia de forma segura para exibição
  const getDaySafely = (dateString) => {
      if(!dateString) return '';
      // Garante que pega a parte do dia se vier 'YYYY-MM-DD'
      const parts = dateString.split('-');
      if(parts.length >= 3) return parts[2].substring(0,2); // substring para o caso de vir hora agarrada
      return '';
  }

  if (loading && transactions.length === 0) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* CABEÇALHO ROXO (INDIGO) */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.userInfo} onPress={() => navigation.navigate('Perfil')}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(userName)}</Text>
              </View>
              <View>
                <Text style={styles.greetingText}>Bom dia,</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
              <Bell size={20} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceSection}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Saldo Total Consolidado</Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeBtn}>
                {showBalance ? <Eye size={18} color="#C7D2FE" /> : <EyeOff size={18} color="#C7D2FE" />}
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceValue}>
              {showBalance ? formatCurrency(totalBalance) : 'R$ •••••'}
            </Text>
          </View>
        </View>

        {/* NAVEGADOR DE MESES SOBREPOSTO */}
        <View style={styles.monthNavigator}>
          <TouchableOpacity onPress={() => mudarMes(-1)} style={styles.monthBtn}>
            <ChevronLeft size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.monthCenter}>
            <Text style={styles.monthName}>{mesAtual}</Text>
            <Text style={styles.yearName}>{anoAtual}</Text>
          </View>
          <TouchableOpacity onPress={() => mudarMes(1)} style={styles.monthBtn}>
            <ChevronRight size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* CARDS DE RECEITA E DESPESA */}
        <View style={styles.cardsRow}>
          <View style={[styles.card, styles.cardIncome]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconIncomeBg}>
                <ArrowUpRight size={14} color="#10B981" />
              </View>
              <Text style={styles.cardLabel}>Receitas</Text>
            </View>
            <Text style={styles.incomeValue}>{showBalance ? formatCurrency(totalIncome) : 'R$ •••••'}</Text>
          </View>

          <View style={[styles.card, styles.cardExpense]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconExpenseBg}>
                <ArrowDownRight size={14} color="#F43F5E" />
              </View>
              <Text style={styles.cardLabel}>Despesas</Text>
            </View>
            <Text style={styles.expenseValue}>{showBalance ? formatCurrency(totalExpense) : 'R$ •••••'}</Text>
          </View>
        </View>

        {/* ALERTA */}
        <View style={styles.alertBox}>
          <AlertCircle size={20} color="#F97316" style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.alertTitle}>Dica Financeira</Text>
            <Text style={styles.alertDesc}>Mantenha seus registros sempre atualizados para um melhor controle dos seus gastos mensais.</Text>
          </View>
        </View>

        {/* PRÓXIMOS VENCIMENTOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos Vencimentos</Text>
            <TouchableOpacity><Text style={styles.linkText}>Ver agenda</Text></TouchableOpacity>
          </View>
          
          {proximosVencimentos.length === 0 ? (
            <View style={styles.billBox}>
               <Text style={styles.emptyText}>Nenhuma conta próxima do vencimento.</Text>
            </View>
          ) : (
            proximosVencimentos.map(conta => (
              <View key={conta.id} style={[styles.txRow, { paddingVertical: 12 }]}>
                <View style={styles.txLeft}>
                  <View style={[styles.txIconBg, { backgroundColor: '#FFF7ED', width: 40, height: 40 }]}>
                    <Calendar size={18} color="#EA580C" />
                  </View>
                  <View>
                    <Text style={styles.txDesc}>{conta.description}</Text>
                    <Text style={[styles.txCat, { color: '#EA580C', fontWeight: '500' }]}>
                      Vence dia {getDaySafely(conta.date)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.txValue}>{formatCurrency(conta.value)}</Text>
              </View>
            ))
          )}
        </View>

        {/* LANÇAMENTOS DO MÊS */}
        <View style={[styles.section, { paddingBottom: 30 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lançamentos do Mês</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Extrato')}>
              <Text style={styles.linkText}>Ver extrato</Text>
            </TouchableOpacity>
          </View>

          {transacoesDoMes.length === 0 ? (
            <View style={styles.emptyBox}>
              <Calendar size={32} color="#D1D5DB" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>Nenhum lançamento registrado.</Text>
            </View>
          ) : (
            transacoesDoMes.slice(0, 4).map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txLeft}>
                  <View style={[styles.txIconBg, { backgroundColor: tx.category?.isIncome ? '#D1FAE5' : '#FFE4E6' }]}>
                    {tx.category?.isIncome ? <ArrowUpRight size={20} color="#10B981"/> : <ArrowDownRight size={20} color="#F43F5E"/>}
                  </View>
                  <View>
                    <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                    <Text style={styles.txCat}>{tx.category?.displayName} • {getDaySafely(tx.date)} {mesAtual.substring(0,3)}</Text>
                  </View>
                </View>
                <Text style={[styles.txValue, { color: tx.category?.isIncome ? '#10B981' : '#111827' }]}>
                  {tx.category?.isIncome ? '+' : '-'}{formatCurrency(tx.value)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 }, // Retornado ao original pois o FAB extra foi removido
  
  header: { backgroundColor: '#4F46E5', paddingTop: 60, paddingBottom: 60, paddingHorizontal: 24, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, backgroundColor: '#818CF8', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  greetingText: { fontSize: 12, color: '#C7D2FE' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  bellBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#F43F5E', borderRadius: 4, borderWidth: 1, borderColor: '#4F46E5' },
  balanceSection: { alignItems: 'center' },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  balanceLabel: { color: '#C7D2FE', fontSize: 14, marginRight: 8 },
  eyeBtn: { padding: 4 },
  balanceValue: { fontSize: 36, fontWeight: 'bold', color: '#fff', tracking: -1 },

  monthNavigator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 24, marginHorizontal: 24, marginTop: -28, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6' },
  monthBtn: { padding: 8 },
  monthCenter: { alignItems: 'center' },
  monthName: { fontSize: 14, fontWeight: 'bold', color: '#111827', textTransform: 'capitalize' },
  yearName: { fontSize: 10, fontWeight: '500', color: '#9CA3AF' },

  cardsRow: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 24, gap: 16 },
  card: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 24, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  cardIncome: { borderColor: 'rgba(16, 185, 129, 0.2)' },
  cardExpense: { borderColor: 'rgba(244, 63, 94, 0.2)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconIncomeBg: { width: 24, height: 24, backgroundColor: '#ECFDF5', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  iconExpenseBg: { width: 24, height: 24, backgroundColor: '#FFF1F2', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  cardLabel: { fontSize: 12, fontWeight: '500', color: '#6B7280' },
  incomeValue: { fontSize: 20, fontWeight: 'bold', color: '#10B981' },
  expenseValue: { fontSize: 20, fontWeight: 'bold', color: '#F43F5E' },

  alertBox: { flexDirection: 'row', backgroundColor: '#FFF7ED', padding: 16, borderRadius: 16, marginHorizontal: 24, marginTop: 24, borderWidth: 1, borderColor: '#FFEDD5' },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: '#9A3412' },
  alertDesc: { fontSize: 12, color: '#C2410C', marginTop: 4, lineHeight: 18 },

  section: { marginHorizontal: 24, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  linkText: { fontSize: 14, fontWeight: '500', color: '#4F46E5' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  billBox: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#F9FAFB' },
  txLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 },
  txIconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txDesc: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  txCat: { fontSize: 12, color: '#6B7280' },
  txValue: { fontSize: 16, fontWeight: 'bold' }
});