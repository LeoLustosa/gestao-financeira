import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import { ArrowLeft, CreditCard } from 'lucide-react-native';
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function AddCardScreen({ route, navigation }) {
  const userId = route.params?.userId;
  
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [network, setNetwork] = useState('Mastercard');
  const [selectedColor, setSelectedColor] = useState('#8B5CF6'); // Roxo padrão

  const cores = ['#8B5CF6', '#F97316', '#10B981', '#3B82F6', '#EF4444', '#EC4899'];

  async function handleSaveCard() {
    if (name.trim() === '' || limit.trim() === '') {
      Alert.alert('Atenção', 'Por favor, preencha o nome do cartão e o limite.');
      return;
    }

    const limitValue = parseFloat(limit.replace(',', '.'));
    if (isNaN(limitValue) || limitValue <= 0) {
      Alert.alert('Erro', 'Insira um limite válido.');
      return;
    }

    try {
      await api.post('/cards', {
        name,
        limit_amount: limitValue,
        network,
        color: selectedColor,
        userId
      });

      Alert.alert('Sucesso!', 'Cartão cadastrado com sucesso.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o cartão.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Cartão</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Pré-visualização do Cartão */}
        <View style={[styles.previewCard, { backgroundColor: selectedColor }]}>
          <Text style={styles.previewName}>{name || 'Nome do Cartão'}</Text>
          <Text style={styles.previewLimit}>R$ {limit ? parseFloat(limit).toFixed(2) : '0,00'}</Text>
          <Text style={styles.previewNetwork}>{network}</Text>
        </View>

        <Text style={styles.label}>NOME DO CARTÃO</Text>
        <TextInput style={styles.input} placeholder="Ex: Nubank Platinum, Itaú Click" value={name} onChangeText={setName} />

        <Text style={styles.label}>LIMITE TOTAL (R$)</Text>
        <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={limit} onChangeText={setLimit} />

        <Text style={styles.label}>BANDEIRA</Text>
        <View style={styles.networkRow}>
          {['Mastercard', 'Visa', 'Elo'].map(net => (
            <TouchableOpacity 
              key={net} 
              style={[styles.networkBtn, network === net && styles.networkBtnActive]} 
              onPress={() => setNetwork(net)}
            >
              <Text style={[styles.networkText, network === net && styles.networkTextActive]}>{net}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>COR DO CARTÃO</Text>
        <View style={styles.colorsRow}>
          {cores.map(cor => (
            <TouchableOpacity 
              key={cor} 
              style={[styles.colorCircle, { backgroundColor: cor }, selectedColor === cor && styles.colorCircleActive]} 
              onPress={() => setSelectedColor(cor)}
            />
          ))}
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: selectedColor }]} onPress={handleSaveCard}>
          <Text style={styles.saveBtnText}>Cadastrar Cartão</Text>
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
  content: { padding: 24, gap: 16 },
  previewCard: { height: 140, borderRadius: 24, padding: 20, justifyContent: 'space-between', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  previewName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  previewLimit: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  previewNetwork: { color: '#fff', opacity: 0.8, fontSize: 12, textAlign: 'right', fontWeight: 'bold' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginLeft: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', padding: 16, borderRadius: 16, fontSize: 14 },
  networkRow: { flexDirection: 'row', gap: 8 },
  networkBtn: { flex: 1, padding: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, alignItems: 'center' },
  networkBtnActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  networkText: { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  networkTextActive: { color: '#4F46E5', fontWeight: 'bold' },
  colorsRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginVertical: 8 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  colorCircleActive: { borderColor: '#111827', transform: [{ scale: 1.1 }] },
  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});