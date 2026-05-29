import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function SetupScreen({ route, navigation }) {
  // Apanha os dados que vieram do Login
  const { userId, userName } = route.params;
  const [balance, setBalance] = useState('2500');

  function handleGoToDashboard() {
    // Leva os dados para a raiz da Aplicação (Tabs)
    navigation.replace('Main', { userId, userName });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configuração Inicial</Text>
        <Text style={styles.subtitle}>Qual o seu saldo atual consolidado?</Text>
        
        <View style={styles.box}>
          <Text style={styles.boxLabel}>Saldo em Contas</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currency}>R$</Text>
            <TextInput 
              style={styles.input} 
              value={balance} 
              onChangeText={setBalance}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleGoToDashboard}>
          <Text style={styles.buttonText}>Ir para o Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4F46E5', justifyContent: 'space-between' },
  content: { padding: 24, marginTop: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#C7D2FE', marginBottom: 40 },
  box: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 32, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  boxLabel: { color: '#C7D2FE', fontSize: 16, fontWeight: '500', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  currency: { color: '#fff', fontSize: 24, opacity: 0.8, marginRight: 8 },
  input: { color: '#fff', fontSize: 40, fontWeight: 'bold', minWidth: 120, textAlign: 'center' },
  footer: { padding: 24, paddingBottom: 40 },
  button: { backgroundColor: '#fff', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#4F46E5', fontSize: 16, fontWeight: 'bold' }
});