import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TrendingUp, TrendingDown, Download, PieChart as PieIcon } from 'lucide-react-native';
import api from '../services/api';

export default function ReportsScreen({ route, navigation }) {
  const userId = route.params?.userId;
  const [loading, setLoading] = useState(true);
  
  // Estados para os dados reais
  const [wealth, setWealth] = useState(0);
  const [trendPercent, setTrendPercent] = useState(0);
  const [isTrendPositive, setIsTrendPositive] = useState(true); // Se gastou menos, é positivo
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([0, 0, 0, 0]); // Últimos 4 meses

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAnalytics();
    });
    loadAnalytics();
    return unsubscribe;
  }, [navigation, userId]);

  async function loadAnalytics() {
    if (!userId) return;
    setLoading(true);
    
    try {
      const response = await api.get(`/transactions?userId=${userId}`);
      const txs = response.data;

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // 1. CÁLCULO DE PATRIMÓNIO GLOBAL (Receitas - Despesas globais)
      let totalIncome = 0;
      let totalExpense = 0;
      txs.forEach(t => {
        if (t.category?.isIncome) totalIncome += t.value;
        else totalExpense += t.value;
      });
      setWealth(totalIncome - totalExpense);

      // 2. CÁLCULO DE TENDÊNCIA (Mês Atual vs Mês Passado)
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      let spentThisMonth = 0;
      let spentLastMonth = 0;

      txs.filter(t => !t.category?.isIncome).forEach(t => {
        const [y, m] = t.date.split('-');
        if (parseInt(y) === currentYear && parseInt(m) === currentMonth) spentThisMonth += t.value;
        if (parseInt(y) === lastMonthYear && parseInt(m) === lastMonth) spentLastMonth += t.value;
      });

      if (spentLastMonth > 0) {
        // Quantos % os gastos aumentaram ou diminuíram?
        const diff = ((spentThisMonth - spentLastMonth) / spentLastMonth) * 100;
        setTrendPercent(Math.abs(diff));
        setIsTrendPositive(diff <= 0); // Gastar menos ou igual = Positivo (Verde)
      } else {
        setTrendPercent(0);
        setIsTrendPositive(true);
      }

      // 3. COMPOSIÇÃO DE GASTOS (As barrinhas de categorias)
      const expensesThisMonth = txs.filter(t => 
        !t.category?.isIncome && 
        parseInt(t.date.split('-')[1]) === currentMonth && 
        parseInt(t.date.split('-')[0]) === currentYear
      );

      const grouped = {};
      expensesThisMonth.forEach(t => {
        const catName = t.category?.displayName || 'Outros';
        const color = t.category?.background || '#8B5CF6'; // Cor da base de dados
        
        if (!grouped[catName]) grouped[catName] = { name: catName, value: 0, color: color };
        grouped[catName].value += t.value;
      });

      const formattedCategories = Object.values(grouped).map(g => ({
        name: g.name,
        percent: spentThisMonth > 0 ? ((g.value / spentThisMonth) * 100) : 0,
        color: g.color
      })).sort((a, b) => b.percent - a.percent); // Ordena da maior % para a menor

      setCategoryData(formattedCategories);

      // 4. HISTÓRICO PARA O GRÁFICO (Últimos 4 meses)
      const history = [0, 0, 0, 0];
      txs.filter(t => !t.category?.isIncome).forEach(t => {
        const txDate = new Date(t.date);
        const monthDiff = (currentYear - txDate.getFullYear()) * 12 + (currentMonth - (txDate.getMonth() + 1));
        
        // Se a despesa for de um dos últimos 4 meses (0 = mês atual, 3 = três meses atrás)
        if (monthDiff >= 0 && monthDiff <= 3) {
          history[3 - monthDiff] += t.value; // Inverte o índice para o gráfico (Mais antigo à esquerda, Atual à direita)
        }
      });
      setMonthlyHistory(history);

    } catch (error) {
      console.log("Erro ao carregar analytics", error);
    } finally {
      setLoading(false);
    }
  }

  // Função segura e bonita para formatar dinheiro (ex: R$ 18.101,08)
  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return 'R$ ' + num.toFixed(2)
      .replace('.', ',')
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  // Função para desenhar o gráfico de barras baseado no histórico
  const renderBarChart = () => {
    const maxSpent = Math.max(...monthlyHistory, 1); // Evita divisão por zero
    
    return (
      <View style={styles.chartContainer}>
        {monthlyHistory.map((val, index) => {
          // Calcula a altura da barra baseada no mês em que gastou mais (esse será 100%)
          const heightPercent = (val / maxSpent) * 100;
          const isCurrentMonth = index === 3;
          
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={[
                styles.bar, 
                isCurrentMonth ? styles.activeBar : {}, 
                { height: `${Math.max(heightPercent, 5)}%` } // Mínimo de 5% de altura para não desaparecer
              ]} />
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterPill, styles.activePill]}>
            <Text style={[styles.filterText, styles.activeText]}>Este Mês</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* CARTÃO DE EVOLUÇÃO */}
        <View style={styles.wealthCard}>
          <Text style={styles.wealthLabel}>Evolução Patrimonial</Text>
          <Text style={styles.wealthValue}>{formatCurrency(wealth)}</Text>
          
          <View style={styles.trendRow}>
            {isTrendPositive ? <TrendingDown size={14} color="#10B981" /> : <TrendingUp size={14} color="#F43F5E" />}
            <Text style={[styles.trendText, { color: isTrendPositive ? '#10B981' : '#F43F5E' }]}>
              {isTrendPositive ? '-' : '+'}{trendPercent.toFixed(1)}% gastos vs mês passado
            </Text>
          </View>

          {renderBarChart()}
        </View>

        {/* COMPOSIÇÃO DE GASTOS */}
        <Text style={styles.sectionTitle}>Composição de Gastos</Text>
        
        {categoryData.length === 0 ? (
          <View style={styles.emptyBox}>
            <PieIcon size={32} color="#D1D5DB" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>Registe despesas para ver a composição.</Text>
          </View>
        ) : (
          <View style={styles.compositionBox}>
            {categoryData.map((cat, idx) => (
              <View key={idx} style={styles.compRow}>
                 <View style={styles.compHeader}>
                   <Text style={styles.compName}>{cat.name}</Text>
                   <Text style={styles.compPercent}>{cat.percent.toFixed(0)}%</Text>
                 </View>
                 <View style={styles.compBar}>
                   <View style={[styles.compFill, { width: `${cat.percent}%`, backgroundColor: cat.color }]} />
                 </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.exportBtn}>
          <Download size={20} color="#374151" />
          <Text style={styles.exportText}>Exportar Excel/PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6' },
  activePill: { backgroundColor: '#4F46E5' },
  filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  activeText: { color: '#fff' },
  
  scroll: { padding: 24, paddingBottom: 40 },
  wealthCard: { backgroundColor: '#fff', borderRadius: 32, padding: 24, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  wealthLabel: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  wealthValue: { fontSize: 32, fontWeight: 'bold', color: '#111827' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  trendText: { fontSize: 12, fontWeight: '600' },
  
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyItems: 'center', gap: 16, height: 120, marginTop: 32 },
  barWrapper: { width: 32, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', backgroundColor: '#E0E7FF', borderRadius: 6 },
  activeBar: { backgroundColor: '#4F46E5' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  compositionBox: { backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 24 },
  compRow: { marginBottom: 20 },
  compHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  compName: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  compPercent: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  compBar: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4 },
  compFill: { height: 8, borderRadius: 4 },

  emptyBox: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6', borderStyle: 'dashed', marginBottom: 24 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },

  exportBtn: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  exportText: { fontSize: 16, fontWeight: 'bold', color: '#374151' }
});