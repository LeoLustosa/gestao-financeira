import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import { ArrowLeft, Target } from 'lucide-react-native';
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function AddGoalScreen({ route, navigation }) {
  const userId = route.params?.userId;

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0D9488'); // Teal padrão

  const cores = ['#0D9488', '#4F46E5', '#10B981', '#EC4899', '#F59E0B', '#EF4444'];

  async function handleSaveGoal() {
    if (name.trim() === '' || targetAmount.trim() === '') {
      Alert.alert('Atenção', 'Por favor, preencha o objetivo e o valor final da meta.');
      return;
    }

    const targetVal = parseFloat(targetAmount.replace(',', '.'));
    const currentVal = currentAmount ? parseFloat(currentAmount.replace(',', '.')) : 0;

    if (isNaN(targetVal) || targetVal <= 0) {
      Alert.alert('Erro', 'Insira um valor final válido.');
      return;
    }

    try {
      await api.post('/goals', {
        name,
        target_amount: targetVal,
        current_amount: currentVal,
        color: selectedColor,
        userId
      });

      Alert.alert('Sucesso!', 'Meta guardada com sucesso.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a meta.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Meta</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.previewIconBox, { backgroundColor: selectedColor }]}>
          <Target size={40} color="#fff" />
        </View>

        <Text style={styles.label}>QUAL O SEU OBJETIVO?</Text>
        <TextInput style={styles.input} placeholder="Ex: Viagem Bahia, Reserva de Emergência" value={name} onChangeText={setName} />

        <Text style={styles.label}>VALOR ALVO (R$)</Text>
        <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={targetAmount} onChangeText={setTargetAmount} />

        <Text style={styles.label}>VALOR JÁ GUARDADO (OPCIONAL - R$)</Text>
        <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={currentAmount} onChangeText={setCurrentAmount} />

        <Text style={styles.label}>COR DA META</Text>
        <View style={styles.colorsRow}>
          {cores.map(cor => (
            <TouchableOpacity 
              key={cor} 
              style={[styles.colorCircle, { backgroundColor: cor }, selectedColor === cor && styles.colorCircleActive]} 
              onPress={() => setSelectedColor(cor)}
            />
          ))}
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: selectedColor }]} onPress={handleSaveGoal}>
          <Text style={styles.saveBtnText}>Criar Meta</Text>
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