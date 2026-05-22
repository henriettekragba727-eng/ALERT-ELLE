import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InscriptionScreen() {
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [voirMotDePasse, setVoirMotDePasse] = useState(false);

  const inscrire = async () => {
    if (!prenom.trim() || !email.trim() || !motDePasse.trim()) {
      Alert.alert('Erreur', 'Remplis au moins le prénom, l’email et le mot de passe.');
      return;
    }

    try {
      const response = await fetch('https://calcpro.allons-y.ci ', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: prenom.trim(),
          email: email.trim(),
          telephone: telephone.trim(),
          mot_de_passe: motDePasse,
        }),
      });

      const data = await response.json();

      if (data.status === 'succes' || data.statut === 'succes') {
        await AsyncStorage.setItem('prenom', data.prenom || prenom.trim());
        await AsyncStorage.setItem(
          'utilisatrice_id',
          String(data.utilisatrice_id || data.id)
        );

        Alert.alert('Succès', 'Compte créé avec succès');
        router.push('/(tabs)/sos');
      } else {
        Alert.alert('Erreur', data.message || 'Inscription impossible.');
      }
    } catch (error) {
      Alert.alert('Erreur réseau', 'Vérifie Apache, MySQL et le Wi-Fi.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte 💜</Text>

      <TextInput
        placeholder="Prénom"
        style={styles.input}
        value={prenom}
        onChangeText={setPrenom}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Téléphone"
        style={styles.input}
        value={telephone}
        onChangeText={setTelephone}
        keyboardType="phone-pad"
      />

      <TextInput
        placeholder="Mot de passe"
        secureTextEntry={!voirMotDePasse}
        style={styles.input}
        value={motDePasse}
        onChangeText={setMotDePasse}
      />

      <TouchableOpacity onPress={() => setVoirMotDePasse(!voirMotDePasse)}>
        <Text style={styles.eyeText}>{voirMotDePasse ? '🙈 Cacher' : '👁️ Voir'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={inscrire}>
        <Text style={styles.buttonText}>S'inscrire</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B21A8',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    color: '#1E1B2E',
  },
  eyeText: {
    color: '#6B21A8',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#9333EA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#6B21A8',
    fontWeight: 'bold',
  },
});