import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Target } from 'lucide-react-native';
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function AddBudgetScreen({ route, navigation }) {
  const userId = route.params?.userId;

  const [category, setCategory] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10B981'); // Emerald padrão

  const cores = ['#10B981', '#EAB308', '#3B82F6', '#8B5CF6', '#F43F5E', '#F97316'];

  async function handleSaveBudget() {
    if (category.trim() === '' || limitAmount.trim() === '') {
      Alert.alert('Atenção', 'Preencha a categoria e o limite do orçamento.');
      return;
    }

    const limitVal = parseFloat(limitAmount.replace(',', '.'));

    if (isNaN(limitVal) || limitVal <= 0) {
      Alert.alert('Erro', 'Insira um limite válido.');
      return;
    }

    try {
      await api.post('/budgets', {
        category,
        limit_amount: limitVal,
        color: selectedColor,
        userId
      });

      Alert.alert('Sucesso!', 'Orçamento criado com sucesso.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o orçamento.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Orçamento</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.previewIconBox, { backgroundColor: selectedColor }]}>
          <Target size={40} color="#fff" />
        </View>

        <Text style={styles.label}>NOME / CATEGORIA DO ORÇAMENTO</Text>
        <TextInput style={styles.input} placeholder="Ex: Mercado, Lazer, Transporte" value={category} onChangeText={setCategory} />

        <Text style={styles.label}>LIMITE MENSAL (R$)</Text>
        <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={limitAmount} onChangeText={setLimitAmount} />

        <Text style={styles.label}>COR DE DESTAQUE</Text>
        <View style={styles.colorsRow}>
          {cores.map(cor => (
            <TouchableOpacity 
              key={cor} 
              style={[styles.colorCircle, { backgroundColor: cor }, selectedColor === cor && styles.colorCircleActive]} 
              onPress={() => setSelectedColor(cor)}
            />
          ))}
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: selectedColor }]} onPress={handleSaveBudget}>
          <Text style={styles.saveBtnText}>Criar Orçamento</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#fff' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  content: { padding: 24, gap: 16, alignItems: 'stretch' },
  previewIconBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginLeft: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', padding: 16, borderRadius: 16, fontSize: 14 },
  colorsRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginVertical: 8 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  colorCircleActive: { borderColor: '#111827', transform: [{ scale: 1.1 }] },
  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});