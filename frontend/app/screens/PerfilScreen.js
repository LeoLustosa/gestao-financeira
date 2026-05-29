import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CheckCircle2, Star, Target, ChevronRight, Moon, Shield, Bell, LogOut, X } from 'lucide-react-native';
import api from '../services/api';

export default function PerfilScreen({ route, navigation }) {
  const userId = route.params?.userId;
  
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function loadUserData() {
      try {
        const response = await api.get(`/users/${userId}`);
        setName(response.data.name);
        setEmail(response.data.email);
      } catch (error) {
        console.log("Erro ao carregar perfil", error);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [userId]);

  // Pega as iniciais para o Avatar
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return fullName.substring(0, 2).toUpperCase();
  };

  function handleLogout() {
    Alert.alert('Sair da Conta', 'Tem a certeza que deseja terminar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive',
        onPress: () => {
          // O reset limpa o histórico, impedindo que o botão "Voltar" do Android retorne à App logada
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
    ]);
  }

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Botão de Fechar Modal */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <X size={24} color="#6B7280" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* CABEÇALHO DO PERFIL */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
            <View style={styles.badgeContainer}>
              <CheckCircle2 size={14} color="#fff" />
            </View>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          
          {/* BANNER PREMIUM */}
          <View style={styles.premiumBanner}>
            <View>
              <View style={styles.premiumTitleRow}>
                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.premiumTitle}>FinApp PRO</Text>
              </View>
              <Text style={styles.premiumDesc}>Relatórios avançados liberados</Text>
            </View>
            <TouchableOpacity style={styles.manageBtn}>
              <Text style={styles.manageBtnText}>Gerenciar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECÇÕES DE DEFINIÇÕES */}
      <View style={styles.section}>
          <Text style={styles.sectionTitle}>MINHA CONTA</Text>
          <View style={styles.cardBox}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate('ManageCategories')} 
            >
              <View style={styles.menuLeft}>
                <Target size={20} color="#4F46E5" />
                <Text style={styles.menuText}>Categorias e Tags</Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
          <View style={styles.cardBox}>
            <TouchableOpacity style={[styles.menuItem, styles.borderBottom]}>
              <View style={styles.menuLeft}>
                <Moon size={20} color="#6B7280" />
                <Text style={styles.menuText}>Tema Escuro</Text>
              </View>
              {/* Toggle Simulado */}
              <View style={styles.toggleBg}>
                <View style={styles.toggleCircle} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuItem, styles.borderBottom]}>
              <View style={styles.menuLeft}>
                <Shield size={20} color="#6B7280" />
                <Text style={styles.menuText}>Segurança e Biometria</Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Bell size={20} color="#6B7280" />
                <Text style={styles.menuText}>Notificações & Alertas</Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#F43F5E" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>FinApp v2.1.0</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8, backgroundColor: '#fff', borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  scroll: { padding: 24, paddingTop: 40, paddingBottom: 40 },
  
  header: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: { width: 96, height: 96, backgroundColor: '#E0E7FF', borderRadius: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#4F46E5' },
  badgeContainer: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, backgroundColor: '#10B981', borderRadius: 14, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  email: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  
  premiumBanner: { width: '100%', marginTop: 24, backgroundColor: '#4F46E5', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  premiumTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  premiumTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  premiumDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  manageBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  manageBtnText: { color: '#4F46E5', fontSize: 12, fontWeight: 'bold' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginBottom: 12, marginLeft: 8 },
  cardBox: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  
  toggleBg: { width: 40, height: 24, backgroundColor: '#E5E7EB', borderRadius: 12, justifyContent: 'center' },
  toggleCircle: { width: 16, height: 16, backgroundColor: '#fff', borderRadius: 8, marginLeft: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FFE4E6', shadowColor: '#F43F5E', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, marginBottom: 16 },
  logoutText: { color: '#F43F5E', fontSize: 16, fontWeight: 'bold' },
  
  versionText: { textAlign: 'center', fontSize: 12, color: '#9CA3AF' }
});