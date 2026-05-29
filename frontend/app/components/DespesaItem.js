import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function DespesaItem({ data, onLongPress }) {
  // Lembra que no Backend nós "aninhamos" a categoria? Aqui nós a usamos!
  const isIncome = data.category?.isIncome;

  // Converte a data de "YYYY-MM-DD" para "DD/MM/YYYY"
  const dataFormatada = data.date.split('-').reverse().join('/');

  return (
    <Pressable
      onLongPress={() => onLongPress(data.id)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.info}>
        <Text style={styles.description}>{data.description}</Text>
        <Text style={styles.date}>{dataFormatada}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        {/* Muda a cor para Verde (Receita) ou Vermelho (Despesa) */}
        <Text style={[styles.value, { color: isIncome ? '#2E7D32' : '#C62828' }]}>
          {isIncome ? '+' : '-'} R$ {data.value.toFixed(2)}
        </Text>
        <Text style={styles.category}>{data.category?.displayName}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pressed: {
    opacity: 0.6,
    backgroundColor: '#f9f9f9',
  },
  info: { flex: 1 },
  description: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 13, color: '#888', marginTop: 4 },
  valueContainer: { alignItems: 'flex-end' },
  value: { fontSize: 16, fontWeight: 'bold' },
  category: { fontSize: 12, color: '#666', marginTop: 4 },
});