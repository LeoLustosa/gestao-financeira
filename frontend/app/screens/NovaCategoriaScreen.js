import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { ArrowLeft, Coffee, ShoppingCart, Car, Home, Zap, Star, Heart, Briefcase, Monitor, Music, Book, Gift } from 'lucide-react-native';
import api from '../services/api';

export default function NovaCategoriaScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [isIncome, setIsIncome] = useState(false); // Falso = Despesa, Verdadeiro = Receita
  const [selectedColor, setSelectedColor] = useState('#8B5CF6'); // Roxo padrão
  const [selectedIcon, setSelectedIcon] = useState('Star');

  // Paleta de cores vibrantes
  const cores = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#64748B'];

  // Biblioteca de ícones disponíveis para escolha
  const iconesDisponiveis = [
    { name: 'Coffee', component: Coffee },
    { name: 'ShoppingCart', component: ShoppingCart },
    { name: 'Car', component: Car },
    { name: 'Home', component: Home },
    { name: 'Zap', component: Zap },
    { name: 'Star', component: Star },
    { name: 'Heart', component: Heart },
    { name: 'Briefcase', component: Briefcase },
    { name: 'Monitor', component: Monitor },
    { name: 'Music', component: Music },
    { name: 'Book', component: Book },
    { name: 'Gift', component: Gift },
  ];

  async function handleSaveCategory() {
    if (displayName.trim() === '') {
      Alert.alert('Atenção', 'Dê um nome à sua nova categoria.');
      return;
    }

    // Criamos um 'name' interno sem espaços (ex: "Viagem Brasil" vira "viagem_brasil")
    const internalName = displayName.toLowerCase().trim().replace(/\s+/g, '_');

    try {
      await api.post('/categories', {
        name: internalName,
        displayName: displayName.trim(),
        icon: selectedIcon,
        background: selectedColor,
        isIncome: isIncome
      });

      Alert.alert('Sucesso!', 'Categoria criada com sucesso.');
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível salvar a categoria.');
    }
  }

  // Descobre qual é o componente do ícone selecionado para a pré-visualização
  const CurrentIconComponent = iconesDisponiveis.find(i => i.name === selectedIcon)?.component || Star;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Categoria</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Pré-visualização Dinâmica */}
        <View style={styles.previewContainer}>
          <View style={[styles.previewIconBox, { backgroundColor: selectedColor }]}>
            <CurrentIconComponent size={40} color="#fff" />
          </View>
          <Text style={[styles.previewText, { color: selectedColor }]}>
            {displayName || 'Nome da Categoria'}
          </Text>
        </View>

        {/* Tipo de Categoria */}
        <Text style={styles.label}>TIPO DE TRANSAÇÃO</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity 
            style={[styles.typeBtn, !isIncome && styles.typeBtnActiveExpense]} 
            onPress={() => setIsIncome(false)}
          >
            <Text style={[styles.typeBtnText, !isIncome && styles.typeTextActiveExpense]}>Despesa</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, isIncome && styles.typeBtnActiveIncome]} 
            onPress={() => setIsIncome(true)}
          >
            <Text style={[styles.typeBtnText, isIncome && styles.typeTextActiveIncome]}>Receita</Text>
          </TouchableOpacity>
        </View>

        {/* Nome */}
        <Text style={styles.label}>NOME DA CATEGORIA</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Pet, Academia, Freelance" 
          value={displayName} 
          onChangeText={setDisplayName} 
          maxLength={20}
        />

        {/* Cores */}
        <Text style={styles.label}>COR DE DESTAQUE</Text>
        <View style={styles.colorsGrid}>
          {cores.map(cor => (
            <TouchableOpacity 
              key={cor} 
              style={[styles.colorCircle, { backgroundColor: cor }, selectedColor === cor && styles.colorCircleActive]} 
              onPress={() => setSelectedColor(cor)}
            />
          ))}
        </View>

        {/* Ícones */}
        <Text style={styles.label}>ESCOLHA UM ÍCONE</Text>
        <View style={styles.iconsGrid}>
          {iconesDisponiveis.map(item => {
            const Icone = item.component;
            const isSelected = selectedIcon === item.name;
            return (
              <TouchableOpacity 
                key={item.name} 
                style={[styles.iconPill, isSelected && { backgroundColor: selectedColor, borderColor: selectedColor }]} 
                onPress={() => setSelectedIcon(item.name)}
              >
                <Icone size={24} color={isSelected ? '#fff' : '#6B7280'} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: selectedColor }]} onPress={handleSaveCategory}>
          <Text style={styles.saveBtnText}>Criar Categoria</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#fff' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  
  content: { padding: 24, gap: 16 },
  
  previewContainer: { alignItems: 'center', marginBottom: 16 },
  previewIconBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  previewText: { fontSize: 18, fontWeight: 'bold', marginTop: 12 },

  label: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginLeft: 4, marginTop: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', padding: 16, borderRadius: 16, fontSize: 16, color: '#111827' },
  
  typeRow: { flexDirection: 'row', backgroundColor: '#E5E7EB', padding: 4, borderRadius: 12 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  typeBtnActiveExpense: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  typeTextActiveExpense: { color: '#F43F5E' },
  typeBtnActiveIncome: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  typeTextActiveIncome: { color: '#10B981' },

  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  colorCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: 'transparent' },
  colorCircleActive: { borderColor: '#111827', transform: [{ scale: 1.1 }] },

  iconsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  iconPill: { width: 56, height: 56, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 24, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});