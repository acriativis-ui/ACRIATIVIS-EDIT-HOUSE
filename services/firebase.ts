
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase para ACRIATIVIS EDIT HOUSE
// IMPORTANTE: Substitua 'SUA_API_KEY_AQUI' pela API Key encontrada no Console do Firebase.
// As chaves BLr0... fornecidas anteriormente são chaves VAPID (Push Notifications) e não devem ser usadas aqui.
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI", // <--- PEGUE ISSO NO CONSOLE DO FIREBASE (Começa com AIza...)
  authDomain: "acriativis-edit-house.firebaseapp.com",
  projectId: "acriativis-edit-house",
  storageBucket: "acriativis-edit-house.appspot.com",
  messagingSenderId: "796213008290",
  appId: "1:796213008290:web:acriativis_app_id" // Opcional, pegue no console se necessário
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços para serem usados no resto do app
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
