import axios from 'axios';
import { Platform } from 'react-native';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DE ENDEREÇO DA API (Para o Backend)
// ------------------------------------------------------------------

// OPÇÃO 1: Para rodar no CELULAR FÍSICO
// Substitua pelo IP local da sua máquina (ex: http://192.168.1.100:3000)
// Encontre o IP com: ipconfig (Windows) ou ifconfig (Mac/Linux)//
//const baseURL = 'http://192.168.1.8:3000';

// OPÇÃO 2: Para o PROFESSOR rodar no EMULADOR (PADRÃO)
const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const api = axios.create({
  baseURL: baseURL,
});

export default api;
