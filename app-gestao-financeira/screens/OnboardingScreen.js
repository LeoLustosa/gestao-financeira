import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { PieChart, Target, Shield } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Controle total", desc: "Acompanhe todos os seus ganhos e gastos em um só lugar, de forma automática e inteligente.", icon: PieChart },
    { title: "Metas e Orçamentos", desc: "Defina limites de gastos por categoria e alcance seus sonhos mais rápido com nossas metas.", icon: Target },
    { title: "Segurança Bank-grade", desc: "Seus dados são protegidos com a mesma tecnologia usada pelos maiores bancos do mundo.", icon: Shield }
  ];

  const CurrentIcon = steps[step].icon;

  function handleNext() {
    if (step < 2) setStep(step + 1);
    else navigation.replace('Login');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <CurrentIcon size={100} color="#6366F1" strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>{steps[step].title}</Text>
        <Text style={styles.desc}>{steps[step].desc}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {steps.map((_, idx) => (
            <View key={idx} style={[styles.dot, idx === step ? styles.dotActive : styles.dotInactive]} />
          ))}
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{step < 2 ? 'Próximo' : 'Começar Agora'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'space-between' },
  header: { alignItems: 'flex-end', padding: 24, marginTop: 20 },
  skipText: { color: '#9CA3AF', fontWeight: '600', fontSize: 16 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  iconCircle: { width: 200, height: 200, backgroundColor: '#EEF2FF', borderRadius: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16, textAlign: 'center' },
  desc: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 },
  footer: { padding: 24, paddingBottom: 40 },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32, gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 32, backgroundColor: '#4F46E5' },
  dotInactive: { width: 8, backgroundColor: '#E0E7FF' },
  button: { backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});