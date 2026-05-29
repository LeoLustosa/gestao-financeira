import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Tag, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react-native';
import api from '../services/api';

export default function TodasDespesasScreen({ navigation, route }) {
  const userId = route.params?.userId;
  const [transactions, setTransactions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Novo Estado para os Filtros (Pills)
  const [activeFilter, setActiveFilter] = useState('Todas'); // 'Todas', 'Receitas', 'Despesas'

  async function loadTransactions() {
    try {
      const response = await api.get(`/transactions?userId=${userId}`);
      setTransactions(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar as transações.');
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions();
    });
    loadTransactions();
    return unsubscribe;
  }, [navigation, currentDate]);

  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const mesAtual = meses[currentDate.getMonth()];
  const anoAtual = currentDate.getFullYear();

  function mudarMes(direcao) {
    const novaData = new Date(currentDate);
    novaData.setMonth(currentDate.getMonth() + direcao);
    setCurrentDate(novaData);
  }

  // Lógica Mestre de Filtros: Filtra por mês E pelo botão clicado!
  const transacoesFiltradas = transactions.filter(t => {
    if (!t.date) return false;
    const [anoT, mesT] = t.date.split('-'); 
    const isMesmoMes = parseInt(anoT) === anoAtual && parseInt(mesT) === (currentDate.getMonth() + 1);
    
    if (!isMesmoMes) return false;

    if (activeFilter === 'Receitas') return t.category?.isIncome === true;
    if (activeFilter === 'Despesas') return t.category?.isIncome === false;
    
    return true; // Se for 'Todas', passa tudo!
  });

  function handleLongPress(item) {
    Alert.alert('Opções', `O que deseja fazer com: ${item.description}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Editar', 
        onPress: () => navigation.navigate('GerenciarDespesa', { transacao: item, userId: userId })
      },
      { 
        text: 'Excluir', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/transactions/${item.id}`);
            loadTransactions(); 
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
        }
      }
    ]);
  }

  // Função segura e bonita para formatar dinheiro (ex: R$ 18.101,08)
  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return 'R$ ' + num.toFixed(2)
      .replace('.', ',')
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  return (
    <View style={styles.container}>
      
      {/* CABEÇALHO COM FILTROS */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Extrato</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          <TouchableOpacity 
            style={[styles.pill, activeFilter === 'Todas' && styles.pillActive]} 
            onPress={() => setActiveFilter('Todas')}
          >
            <Text style={[styles.pillText, activeFilter === 'Todas' && styles.pillTextActive]}>Todas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.pill, activeFilter === 'Receitas' && styles.pillActive]} 
            onPress={() => setActiveFilter('Receitas')}
          >
            <Text style={[styles.pillText, activeFilter === 'Receitas' && styles.pillTextActive]}>Receitas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.pill, activeFilter === 'Despesas' && styles.pillActive]} 
            onPress={() => setActiveFilter('Despesas')}
          >
            <Text style={[styles.pillText, activeFilter === 'Despesas' && styles.pillTextActive]}>Despesas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.pill} onPress={() => Alert.alert('Em breve', 'O sistema de tags será implementado na próxima versão!')}>
            <Tag size={14} color="#6B7280" style={{ marginRight: 4 }} />
            <Text style={styles.pillText}>Tags</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.content}>
        
        {/* NAVEGAÇÃO DE MESES */}
        <View style={styles.monthNav}>
          <Text style={styles.monthTitle}>{mesAtual} {anoAtual}</Text>
          <View style={styles.monthButtons}>
            <TouchableOpacity onPress={() => mudarMes(-1)} style={styles.iconBtn}>
              <ChevronLeft size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => mudarMes(1)} style={styles.iconBtn}>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTA DE TRANSAÇÕES */}
        {transacoesFiltradas.length === 0 ? (
          <View style={styles.emptyContainer}>
             <Calendar size={32} color="#D1D5DB" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>Nenhum registro encontrado neste mês.</Text>
          </View>
        ) : (
          <FlatList
            data={transacoesFiltradas}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => {
              const isIncome = item.category?.isIncome;
              return (
                <TouchableOpacity 
                  onLongPress={() => handleLongPress(item)} 
                  activeOpacity={0.7}
                  style={styles.txCard}
                >
                  <View style={styles.txLeft}>
                    <View style={[styles.iconBg, { backgroundColor: isIncome ? '#D1FAE5' : '#FFE4E6' }]}>
                      {isIncome ? <ArrowUpRight size={20} color="#10B981" /> : <ArrowDownRight size={20} color="#F43F5E" />}
                    </View>
                    <View>
                      <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
                      <Text style={styles.txCat}>{item.category?.displayName} • {item.date.split('-')[2]} {mesAtual.substring(0,3)}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txValue, { color: isIncome ? '#10B981' : '#111827' }]}>
                      {isIncome ? '+' : '-'}{formatCurrency(item.value)}
                    </Text>
                    {/* Placeholder para Tags futuras (exigiria alteração no banco) */}
                    {item.category?.displayName && (
                       <View style={styles.tagBadge}>
                         <Text style={styles.tagText}>#{item.category.displayName.toLowerCase()}</Text>
                       </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#fff', paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 16 },
  filtersContainer: { paddingHorizontal: 24, gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  pillActive: { backgroundColor: '#4F46E5' },
  pillText: { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  pillTextActive: { color: '#fff' },
  
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthTitle: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 },
  monthButtons: { flexDirection: 'row', gap: 8 },
  iconBtn: { backgroundColor: '#fff', padding: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  
  txCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  txLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 },
  iconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txDesc: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  txCat: { fontSize: 12, color: '#6B7280' },
  txValue: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  tagBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#E0E7FF' },
  tagText: { fontSize: 10, color: '#4F46E5' }
});