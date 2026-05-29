import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Trash2, Coffee, ShoppingCart, Car, Home, Zap, Star, Heart, Briefcase, Monitor, Music, Book, Gift, Tag } from 'lucide-react-native';
import api from '../services/api';

// Dicionário de Ícones para voltar a desenhá-los no ecrã
const iconesDisponiveis = {
  Coffee, ShoppingCart, Car, Home, Zap, Star, Heart, Briefcase, Monitor, Music, Book, Gift
};

export default function ManageCategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, name) {
    Alert.alert(
      'Apagar Categoria',
      `Tem a certeza que deseja apagar a categoria "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Apagar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/categories/${id}`);
              // Atualiza a lista na hora, removendo o que foi apagado
              setCategories(prev => prev.filter(c => c.id !== id));
            } catch (error) {
              const msg = error.response?.data?.error || 'Erro ao apagar categoria.';
              Alert.alert('Atenção', msg);
            }
          }
        }
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Categorias</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {categories.map(cat => {
          // Puxa o ícone correto ou usa um genérico (Tag) se não encontrar
          const IconComponent = iconesDisponiveis[cat.icon] || Tag;
          
          return (
            <View key={cat.id} style={styles.categoryCard}>
              <View style={styles.cardLeft}>
                <View style={[styles.iconBox, { backgroundColor: cat.background || '#8B5CF6' }]}>
                  <IconComponent size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.catName}>{cat.displayName}</Text>
                  <Text style={styles.catType}>{cat.isIncome ? 'Receita' : 'Despesa'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => handleDelete(cat.id, cat.displayName)}
              >
                <Trash2 size={20} color="#F43F5E" />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#fff' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  content: { padding: 24, gap: 12 },
  
  categoryCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  catType: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  deleteBtn: { padding: 8, backgroundColor: '#FFF1F2', borderRadius: 8 }
});