import axios from 'axios';
import { Platform } from 'react-native';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DE ENDEREÇO DA API (Para o Backend)
// ------------------------------------------------------------------

// OPÇÃO 1: Para rodar no CELULAR FÍSICO (
//const baseURL = 'http://192.168.35.67:3000'; 

// OPÇÃO 2: Para o PROFESSOR rodar no EMULADOR 
const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const api = axios.create({
  baseURL: baseURL,
});

export default api;