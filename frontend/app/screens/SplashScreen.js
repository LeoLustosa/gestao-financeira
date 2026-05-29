import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wallet } from 'lucide-react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Onboarding'), 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Wallet size={48} color="#fff" />
      </View>
      <Text style={styles.title}>FinApp</Text>
      <Text style={styles.subtitle}>Sua vida financeira no controle</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
  iconContainer: { 
    width: 96, height: 96, backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24 
  },
  title: { fontSize: 30, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#C7D2FE', marginTop: 8 }
});