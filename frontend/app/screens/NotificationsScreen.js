import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { ArrowLeft, CheckCircle, AlertTriangle, Info, CheckCircle2, Trash2 } from 'lucide-react-native';

export default function NotificationsScreen({ navigation }) {
  // Simulando notificações geradas pelo sistema
  const [notifications, setNotifications] = useState([
    { 
      id: '1', 
      title: 'Bem-vindo ao FinApp!', 
      message: 'Comece a registar as suas despesas para ter o controlo total da sua vida financeira.', 
      type: 'success', 
      read: false, 
      time: 'Agora mesmo' 
    },
    { 
      id: '2', 
      title: 'Atenção ao Orçamento', 
      message: 'Você já utilizou 85% do seu orçamento mensal para "Lazer".', 
      type: 'warning', 
      read: false, 
      time: 'Há 2 horas' 
    },
    { 
      id: '3', 
      title: 'Dica Financeira', 
      message: 'Sabia que a regra 50/30/20 pode ajudar a organizar o seu dinheiro? Guarde 20% do que ganha!', 
      type: 'info', 
      read: true, 
      time: 'Ontem' 
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={24} color="#10B981" />;
      case 'warning': return <AlertTriangle size={24} color="#F59E0B" />;
      default: return <Info size={24} color="#3B82F6" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificações</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={markAllAsRead} style={styles.actionBtn}>
            <CheckCircle2 size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearNotifications} style={styles.actionBtn}>
            <Trash2 size={20} color="#F43F5E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA DE NOTIFICAÇÕES */}
      <View style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <CheckCircle size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Não tem novas notificações.</Text>
            <Text style={styles.emptySubText}>Você está em dia com as suas finanças!</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.notificationCard, !item.read && styles.unreadCard]}
                onPress={() => {
                  // Marca apenas esta como lida ao clicar
                  setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
                }}
              >
                <View style={styles.iconBox}>
                  {getIcon(item.type)}
                </View>
                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                  </View>
                  <Text style={styles.message}>{item.message}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#fff' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', gap: 16 },
  backBtn: { padding: 4 },
  actionBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  
  content: { flex: 1, padding: 24 },
  
  notificationCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'flex-start' },
  unreadCard: { backgroundColor: '#EEF2FF', borderColor: '#E0E7FF' },
  
  iconBox: { marginRight: 16, marginTop: 2 },
  textContainer: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '600', color: '#374151', flex: 1 },
  unreadText: { color: '#111827', fontWeight: 'bold' },
  time: { fontSize: 12, color: '#9CA3AF', marginLeft: 8 },
  message: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4F46E5', marginLeft: 12, marginTop: 6 },

  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#6B7280', textAlign: 'center' }
});