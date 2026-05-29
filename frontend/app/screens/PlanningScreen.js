import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CreditCard, Target, Star, Plus, ChevronRight } from 'lucide-react-native';
import api from '../services/api';

export default function PlanningScreen({ route, navigation }) {
  const userId = route.params?.userId;
  
  // DECLARAÇÃO DOS ESTADOS REAIS
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]); // <-- AQUI: Garantia que existe!

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPlanningData();
    });
    loadPlanningData();
    return unsubscribe;
  }, [navigation, userId]);

  async function loadPlanningData() {
    if (!userId) return;
    setLoading(true);
    try {
      // Procura os 3 dados ao mesmo tempo
      const [cardsResponse, goalsResponse, budgetsResponse] = await Promise.all([
        api.get(`/cards?userId=${userId}`),
        api.get(`/goals?userId=${userId}`),
        api.get(`/budgets?userId=${userId}`)
      ]);
      
      setCards(cardsResponse.data);
      setGoals(goalsResponse.data);
      setBudgets(budgetsResponse.data);
    } catch (error) {
      console.log("Erro ao carregar planejamento", error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddCard() {
    navigation.navigate('AddCard', { userId });
  }

  function handleAddGoal() {
    navigation.navigate('AddGoal', { userId });
  }

function handleAddBudget() {
    navigation.navigate('AddBudget', { userId });
  }

  // Função segura e bonita para formatar dinheiro (ex: R$ 18.101,08)
  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return 'R$ ' + num.toFixed(2)
      .replace('.', ',')
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  // ... (o resto do arquivo com o return e os styles continua igual)
  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planejamento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* SECÇÃO: MEUS CARTÕES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleGroup}>
              <CreditCard size={20} color="#4F46E5" />
              <Text style={styles.sectionTitle}>Meus Cartões</Text>
            </View>
            <TouchableOpacity style={styles.manageBadge} onPress={handleAddCard}>
              <Plus size={14} color="#4F46E5" style={{ marginRight: 2 }} />
              <Text style={styles.manageText}>Novo</Text>
            </TouchableOpacity>
          </View>

          {cards.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Você ainda não possui cartões cadastrados.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
              {cards.map(card => (
                <View key={card.id} style={[styles.cardContainer, { backgroundColor: card.color || '#8B5CF6' }]}>
                  <Text style={styles.cardName}>{card.name}</Text>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardLabel}>Fatura Atual</Text>
                    <Text style={styles.cardValue}>{formatCurrency(card.used_amount)}</Text>
                  </View>
                  <View style={styles.cardFooter}>
                     <View>
                       <Text style={styles.cardSubLabel}>Disponível</Text>
                       <Text style={styles.cardSubValue}>{formatCurrency(card.limit_amount - card.used_amount)}</Text>
                     </View>
                     <Text style={styles.network}>{card.network || 'Cartão'}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* SECÇÃO: ORÇAMENTOS (Budgets) */}
        <View style={styles.sectionHeader}>
         <View style={styles.titleGroup}>
           <Target size={20} color="#4F46E5" />
           <Text style={styles.sectionTitle}>Orçamentos</Text>
         </View>
         <TouchableOpacity onPress={handleAddBudget}><Plus size={24} color="#4F46E5" /></TouchableOpacity>
       </View>

       {budgets.length === 0 ? (
         <View style={styles.emptyBox}>
           <Text style={styles.emptyText}>Defina limites mensais para controlar seus gastos.</Text>
         </View>
       ) : (
         budgets.map(b => {
           const percent = (b.spent_amount / b.limit_amount) * 100;
           const isOver = percent > 90;
           return (
             <View key={b.id} style={styles.budgetBox}>
               <View style={styles.budgetTop}>
                 <View>
                   <Text style={styles.budgetName}>{b.category}</Text>
                   <Text style={styles.budgetSub}>{formatCurrency(b.spent_amount)} de {formatCurrency(b.limit_amount)}</Text>
                 </View>
                 <Text style={[styles.budgetPercent, isOver && {color: '#F43F5E'}]}>{percent.toFixed(0)}%</Text>
               </View>
               <View style={styles.progressBar}>
                 <View style={[styles.progressFill, { width: `${Math.min(percent, 100)}%`, backgroundColor: isOver ? '#F43F5E' : b.color }]} />
               </View>
             </View>
           );
         })
       )}

        {/* SECÇÃO: METAS */}
        <View style={styles.section}>
           <View style={styles.sectionHeader}>
            <View style={styles.titleGroup}>
              <Star size={20} color="#4F46E5" />
              <Text style={styles.sectionTitle}>Metas</Text>
            </View>
            <TouchableOpacity onPress={handleAddGoal}>
              <Plus size={24} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          
          {goals.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Crie metas para os seus sonhos!</Text>
            </View>
          ) : (
            goals.map(goal => {
              const percent = (goal.current_amount / goal.target_amount) * 100;
              return (
                <View key={goal.id} style={styles.goalBox}>
                  <View style={[styles.goalIcon, { backgroundColor: goal.color || '#0D9488' }]}>
                    <Star size={24} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <View style={styles.goalInfoRow}>
                      <Text style={styles.goalValue}>{formatCurrency(goal.current_amount)}</Text>
                      <Text style={styles.goalTarget}>{formatCurrency(goal.target_amount)}</Text>
                    </View>
                    <View style={styles.goalBar}>
                      <View style={[styles.goalFill, { width: `${Math.min(percent, 100)}%`, backgroundColor: goal.color || '#0D9488' }]} />
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  scroll: { padding: 24, paddingBottom: 60 },
  
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  manageBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  manageText: { fontSize: 12, color: '#4F46E5', fontWeight: 'bold' },
  
  emptyBox: { backgroundColor: '#fff', padding: 24, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  emptyText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center' },

  cardsScroll: { gap: 16 },
  cardContainer: { width: 260, padding: 20, borderRadius: 24, height: 160, justifyContent: 'space-between', marginRight: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  cardName: { color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
  cardValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardSubLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 8 },
  cardSubValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  network: { color: '#fff', opacity: 0.8, fontSize: 10, fontWeight: 'bold' },

  budgetBox: { backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  budgetName: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  budgetSub: { fontSize: 12, color: '#6B7280' },
  budgetPercent: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  progressBar: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },

  goalBox: { backgroundColor: '#fff', padding: 16, borderRadius: 20, flexDirection: 'row', gap: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 12 },
  goalIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  goalName: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  goalInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 8 },
  goalValue: { fontSize: 12, color: '#6B7280' },
  goalTarget: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
  goalBar: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3 },
  goalFill: { height: 6, borderRadius: 3 }
});