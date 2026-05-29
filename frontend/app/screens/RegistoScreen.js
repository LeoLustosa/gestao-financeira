import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../services/api';

export default function RegistoScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister() {
    if (name.trim() === '' || email.trim() === '' || password === '') {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Envia os dados para a nossa rota de registo no Backend
      await api.post('/register', { name, email, password });
      
      Alert.alert('Sucesso!', 'A sua conta foi criada. Pode fazer login agora!');
      navigation.goBack(); // Volta automaticamente para o ecrã de Login
    } catch (error) {
      const mensagemErro = error.response?.data?.error || 'Verifique os dados informados.';
      Alert.alert('Erro no Registo', mensagemErro);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Nova Conta</Text>
      
      <Text style={styles.label}>Como quer ser chamado?</Text>
      <TextInput style={styles.input} placeholder="O seu Nome" value={name} onChangeText={setName} />
      
      <Text style={styles.label}>E-mail:</Text>
      <TextInput style={styles.input} placeholder="exemplo@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      
      <Text style={styles.label}>Palavra-passe:</Text>
      <TextInput style={styles.input} placeholder="No mínimo 4 caracteres" value={password} onChangeText={setPassword} secureTextEntry={true} />
      
      <View style={styles.btnContainer}>
        <Button title="Registar e Criar Conta" onPress={handleRegister} color="#28a745" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  btnContainer: { marginTop: 10 }
});