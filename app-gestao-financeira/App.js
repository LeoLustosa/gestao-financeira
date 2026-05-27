import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, FileText, Target, PieChart, Plus } from 'lucide-react-native'; // <-- Adicionado o Plus!

// IMPORTAÇÕES CORRETAS
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SetupScreen from './screens/SetupScreen';
import LoginScreen from './screens/LoginScreen';
import RegistoScreen from './screens/RegistoScreen';
import PerfilScreen from './screens/PerfilScreen';
import GerenciarDespesaScreen from './screens/GerenciarDespesaScreen';
import NovaCategoriaScreen from './screens/NovaCategoriaScreen';
import ResumoScreen from './screens/ResumoScreen';
import TodasDespesasScreen from './screens/TodasDespesasScreen';
import PlanningScreen from './screens/PlanningScreen';
import ReportsScreen from './screens/ReportsScreen';
import AddCardScreen from './screens/AddCardScreen';
import AddGoalScreen from './screens/AddGoalScreen';
import AddBudgetScreen from './screens/AddBudgetScreen';
import ManageCategoriesScreen from './screens/ManageCategoriesScreen';
import NotificationsScreen from './screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- O BOTÃO FLUTUANTE CENTRAL (+) ---
const CustomTabBarButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.fabContainer}
      onPress={() => navigation.navigate('GerenciarDespesa')} // Abre o modal por cima de tudo!
      activeOpacity={0.8}
    >
      <View style={styles.fabButton}>
        <Plus size={28} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

// --- O SEU NOVO RODAPÉ (TAB BAR) ---
function MainTabs({ route }) {
  const userName = route.params?.userName || 'Utilizador';
  const userId = route.params?.userId; 

  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({ 
        headerShown: false, 
        tabBarStyle: { 
          backgroundColor: '#fff',
          borderTopColor: '#f3f4f6',
          height: 70,          
          paddingBottom: 20,   
          paddingTop: 10,
          elevation: 10, // Sombra para Android
          shadowColor: '#000', // Sombra para iOS
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: '#4F46E5', 
        tabBarInactiveTintColor: '#9CA3AF', 
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500', marginTop: 4 },
        tabBarIcon: ({ color }) => {
          if (route.name === 'Home') return <Home color={color} size={24} />;
          if (route.name === 'Extrato') return <FileText color={color} size={24} />;
          if (route.name === 'Planos') return <Target color={color} size={24} />;
          if (route.name === 'Análise') return <PieChart color={color} size={24} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={ResumoScreen} initialParams={{ userName, userId }} />
      <Tab.Screen name="Extrato" component={TodasDespesasScreen} initialParams={{ userId }} />
      
      {/* A MÁGICA ACONTECE AQUI: Uma aba falsa que só renderiza o botão flutuante */}
      <Tab.Screen 
        name="Add" 
        component={View} 
        options={{ 
          tabBarButton: () => <CustomTabBarButton />,
          tabBarLabel: () => null // Esconde o texto desta aba
        }} 
      />
      
      <Tab.Screen name="Planos" component={PlanningScreen} initialParams={{ userId }} />
      <Tab.Screen name="Análise" component={ReportsScreen} initialParams={{ userId }} />
    </Tab.Navigator>
  );
}

// --- NAVEGAÇÃO PRINCIPAL ---
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registo" component={RegistoScreen} />
        
        <Stack.Screen name="Main" component={MainTabs} />
        
        {/* Modais Overlay */}
        <Stack.Screen name="GerenciarDespesa" component={GerenciarDespesaScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="NovaCategoria" component={NovaCategoriaScreen} options={{ presentation: 'modal' }} />
        
        {/* A tela de perfil agora será acedida pelo Avatar no Cabeçalho da Home */}
        <Stack.Screen name="Perfil" component={PerfilScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
     <Stack.Screen name="AddGoal" component={AddGoalScreen} />
      <Stack.Screen name="AddBudget" component={AddBudgetScreen} />
      <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -25, // Faz o botão "subir" para fora do rodapé
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6, // Sombra flutuante no Android
  }
});