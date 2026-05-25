import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  const connecter = async () => {
    try {
      const response = await fetch('https://calcpro.allons-y.ci/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          mot_de_passe: motDePasse,
        }),
      });

      const data = await response.json();

      if (data.statut === 'succes' || data.status === 'succes') {
        await AsyncStorage.setItem('prenom', data.utilisatrice.prenom);
await AsyncStorage.setItem('utilisatrice_id', String(data.utilisatrice.id));
        Alert.alert('Succès', 'Connexion réussie');
        router.push('/(tabs)/sos');
      } else {
        Alert.alert('Erreur', data.message);
      }
    } catch (error) {
      Alert.alert('Erreur réseau');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion 💜</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        style={styles.input}
        value={motDePasse}
        onChangeText={setMotDePasse}
      />

      <TouchableOpacity style={styles.button} onPress={connecter}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/inscription')}>
        <Text style={styles.link}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#F5F3FF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7B2CBF',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#9333EA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    textAlign: 'center',
    color: '#7B2CBF',
    fontSize: 18,
  },
});