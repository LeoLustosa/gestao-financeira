import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, FileText, Calendar, Tag, RefreshCcw, Camera } from 'lucide-react-native';
import api from '../services/api';

export default function GerenciarDespesaScreen({ route, navigation }) {
  const transacaoParaEditar = route.params?.transacao;
  const userId = route.params?.userId; 

  // Estados principais
  const [type, setType] = useState(transacaoParaEditar?.category?.isIncome ? 'income' : 'expense');
  const [description, setDescription] = useState(transacaoParaEditar ? transacaoParaEditar.description : '');
  const [value, setValue] = useState(transacaoParaEditar ? transacaoParaEditar.value.toString() : '');
  const [date, setDate] = useState(transacaoParaEditar ? transacaoParaEditar.date : new Date().toISOString().split('T')[0]);
  
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(transacaoParaEditar ? transacaoParaEditar.categoryId : '');
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar as categorias.');
      }
    }
    loadCategories();
  }, []);

  // Filtra as categorias com base no tipo selecionado (Receita ou Despesa)
  const displayedCategories = categories.filter(c => type === 'income' ? c.isIncome : !c.isIncome);

  async function handleSave() {
    if (description.trim() === '' || value === '' || date === '' || selectedCategoryId === '') {
      Alert.alert('Atenção', 'Preencha o valor, a descrição e escolha uma categoria.');
      return;
    }

    const valorFormatado = parseFloat(value.replace(',', '.'));

    if (isNaN(valorFormatado) || valorFormatado <= 0) {
      Alert.alert('Atenção', 'Insira um valor numérico válido e maior que zero.');
      return;
    }

    try {
      if (transacaoParaEditar) {
        await api.delete(`/transactions/${transacaoParaEditar.id}`);
      }
      
      await api.post('/transactions', {
        description, 
        value: valorFormatado, 
        date, 
        categoryId: selectedCategoryId, 
        userId: userId
      });
      
      Alert.alert('Sucesso!', 'Lançamento guardado com sucesso.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o lançamento.');
    }
  }

  // Cores dinâmicas baseadas no tipo
  const getThemeColor = () => {
    if (type === 'income') return '#10B981'; // Emerald 500
    if (type === 'expense') return '#F43F5E'; // Rose 500
    return '#374151'; // Gray 700 (Transfer)
  };

  const themeColor = getThemeColor();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      
      {/* CABEÇALHO DINÂMICO */}
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{transacaoParaEditar ? 'Editar Lançamento' : 'Novo Lançamento'}</Text>
          <View style={{ width: 24 }} /> 
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>
            Valor da {type === 'income' ? 'Receita' : type === 'expense' ? 'Despesa' : 'Transferência'}
          </Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currency}>R$</Text>
            <TextInput 
              style={styles.amountInput}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>
        </View>
      </View>

      {/* CORPO DO FORMULÁRIO */}
      <View style={styles.body}>
        
        {/* SELETOR DE TIPO */}
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
            onPress={() => { setType('expense'); setSelectedCategoryId(''); }}
          >
            <Text style={[styles.typeBtnText, type === 'expense' && styles.typeTextActiveExpense]}>Despesa</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
            onPress={() => { setType('income'); setSelectedCategoryId(''); }}
          >
            <Text style={[styles.typeBtnText, type === 'income' && styles.typeTextActiveIncome]}>Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'transfer' && styles.typeBtnActiveTransfer]}
            onPress={() => { setType('transfer'); setSelectedCategoryId(''); Alert.alert('Em breve', 'Transferências entre contas chegarão na próxima atualização!'); }}
          >
            <Text style={[styles.typeBtnText, type === 'transfer' && styles.typeTextActiveTransfer]}>Transf.</Text>
          </TouchableOpacity>
        </View>

        {/* ABAS */}
        <View style={styles.tabsRow}>
          <TouchableOpacity onPress={() => setActiveTab('basic')} style={[styles.tab, activeTab === 'basic' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'basic' && styles.tabTextActive]}>Principal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('extra')} style={[styles.tab, activeTab === 'extra' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'extra' && styles.tabTextActive]}>Opções Extras</Text>
            <View style={styles.tabDot} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
          {activeTab === 'basic' ? (
            <View style={styles.formSection}>
              
              <Text style={styles.label}>DESCRIÇÃO</Text>
              <View style={styles.inputWrapper}>
                <FileText size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder={type === 'income' ? "Ex: Salário da Empresa X" : "Ex: Almoço Restaurante"}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <Text style={styles.label}>DATA</Text>
              <View style={styles.inputWrapper}>
                <Calendar size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="AAAA-MM-DD"
                  value={date}
                  onChangeText={setDate}
                />
              </View>

              <View style={styles.categoryHeader}>
                <Text style={[styles.label, { marginBottom: 0 }]}>{type === 'income' ? 'ORIGEM' : 'CATEGORIA'}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('NovaCategoria')}>
                  <Text style={styles.addCategoryText}>+ Nova</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.categoriesGrid}>
                {displayedCategories.map(cat => (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={[styles.categoryPill, selectedCategoryId === cat.id && { backgroundColor: themeColor, borderColor: themeColor }]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Text style={[styles.categoryText, selectedCategoryId === cat.id && styles.categoryTextActive]}>
                      {cat.displayName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

            </View>
          ) : (
            <View style={styles.formSection}>
              {/* Opções Visuais do Protótipo (Sem funcionalidade de banco ainda) */}
              <View style={styles.extraOption}>
                <View style={styles.extraLeft}>
                  <RefreshCcw size={20} color="#6B7280" />
                  <Text style={styles.extraText}>Tornar Recorrente / Parcelar</Text>
                </View>
                <Text style={styles.comingSoonText}>Em breve</Text>
              </View>

              <View style={styles.extraOption}>
                <View style={styles.extraLeft}>
                  <Tag size={20} color="#6B7280" />
                  <Text style={styles.extraText}>Adicionar Tags</Text>
                </View>
                <Text style={styles.comingSoonText}>Em breve</Text>
              </View>

              <View style={styles.extraOption}>
                <View style={styles.extraLeft}>
                  <Camera size={20} color="#6B7280" />
                  <Text style={styles.extraText}>Anexar Recibo</Text>
                </View>
                <TouchableOpacity style={styles.addBtn}><Text style={styles.addBtnText}>Add</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: themeColor, shadowColor: themeColor }]} 
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Salvar Lançamento</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  
  amountSection: { alignItems: 'center' },
  amountLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  currency: { color: '#fff', fontSize: 32, opacity: 0.8, marginRight: 8, fontWeight: 'bold' },
  amountInput: { color: '#fff', fontSize: 48, fontWeight: 'bold', minWidth: 150, textAlign: 'center' },

  body: { flex: 1, backgroundColor: '#F9FAFB', marginTop: -24, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  
  typeSelector: { flexDirection: 'row', backgroundColor: '#E5E7EB', padding: 4, borderRadius: 12, marginBottom: 24 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  typeBtnActiveExpense: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  typeTextActiveExpense: { color: '#F43F5E' },
  typeBtnActiveIncome: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  typeTextActiveIncome: { color: '#10B981' },
  typeBtnActiveTransfer: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  typeTextActiveTransfer: { color: '#374151' },

  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 24 },
  tab: { paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4F46E5' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: '#4F46E5' },
  tabDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4F46E5', marginLeft: 6 },

  formScroll: { paddingBottom: 40 },
  formSection: { gap: 16 },
  
  label: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginLeft: 8 },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F3F4F6', padding: 16, paddingLeft: 48, borderRadius: 16, fontSize: 14, color: '#111827', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },

  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  addCategoryText: { fontSize: 14, fontWeight: 'bold', color: '#4F46E5' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryPill: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  categoryTextActive: { color: '#fff', fontWeight: 'bold' },

  extraOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  extraLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  extraText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  comingSoonText: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },
  addBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { fontSize: 12, fontWeight: 'bold', color: '#4B5563' },

  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 16, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});