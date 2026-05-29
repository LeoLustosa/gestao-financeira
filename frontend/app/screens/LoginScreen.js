import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Fingerprint } from 'lucide-react-native';
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (email.trim() === '' || password === '') {
      Alert.alert('Atenção', 'Preencha o e-mail e a palavra-passe.');
      return;
    }
    try {
      // Faz a validação REAL no banco de dados!
      const response = await api.post('/login', { email, password });
      const { id, name } = response.data.user;
      
      // Vai para o Setup levando os dados do utilizador!
      navigation.replace('Setup', { userId: id, userName: name });
    } catch (error) {
      const mensagemErro = error.response?.data?.error || 'Erro de conexão.';
      Alert.alert('Falha no Acesso', mensagemErro);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.replace('Onboarding')} style={styles.backBtn}>
        <ArrowLeft size={20} color="#6B7280" />
      </TouchableOpacity>

      <View style={styles.headerBox}>
        <Text style={styles.title}>Acesse sua conta</Text>
        <Text style={styles.subtitle}>Insira seus dados para acessar sua carteira.</Text>
      </View>
      
      <View style={styles.formContainer}>
        <TextInput 
          style={styles.input} placeholder="E-mail" 
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} placeholder="Senha" 
          value={password} onChangeText={setPassword} secureTextEntry
        />
        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Registo')}>
            <Text style={styles.linkText}>Criar conta</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.linkTextBold}>Esqueci a senha</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
          <Text style={styles.primaryBtnText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Fingerprint size={20} color="#4F46E5" />
          <Text style={styles.secondaryBtnText}>Usar Biometria</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 40, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  headerBox: { marginTop: 32, marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 8 },
  formContainer: { flex: 1, gap: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', padding: 16, borderRadius: 16, fontSize: 16, color: '#111827' },
  linksRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 8 },
  linkText: { fontSize: 14, color: '#6B7280' },
  linkTextBold: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
  footer: { marginBottom: 40, gap: 12 },
  primaryBtn: { backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryBtn: { flexDirection: 'row', backgroundColor: '#EEF2FF', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryBtnText: { color: '#4F46E5', fontSize: 16, fontWeight: 'bold' }
});