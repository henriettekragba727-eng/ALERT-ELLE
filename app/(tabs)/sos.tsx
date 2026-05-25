import { StyleSheet, Text, View, TouchableOpacity, Alert, Pressable, Animated, StatusBar } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://calcpro.allons-y.ci';

export default function SOSScreen() {
  const compteur = useRef(0);
  const resetTimer = useRef<any>(null);
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;

  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [nomUtilisateur, setNomUtilisateur] = useState('Utilisatrice');
  const [utilisatriceId, setUtilisatriceId] = useState<number | null>(null);

  useEffect(() => {
    chargerDonnees();
    startPulse();
  }, []);

  useEffect(() => {
    if (utilisatriceId) {
      chargerContactsDepuisAPI(utilisatriceId);
    }
  }, [utilisatriceId]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse1, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulse2, { toValue: 1.6, duration: 1200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulse1, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulse2, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ]),
      ])
    ).start();
  };

  const chargerDonnees = async () => {
    try {
      const prenom = await AsyncStorage.getItem('prenom');
      const id = await AsyncStorage.getItem('utilisatrice_id');
      if (prenom) setNomUtilisateur(prenom);
      if (id) setUtilisatriceId(Number(id));
    } catch (error) {
      console.log(error);
    }
  };

  const chargerContactsDepuisAPI = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/contacts.php?utilisatrice_id=${id}`);
      const data = await response.json();
      if (data.status === 'succes') {
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deconnexion = async () => {
    await AsyncStorage.removeItem('prenom');
    await AsyncStorage.removeItem('utilisatrice_id');
    router.push('/login');
  };

  const envoyerSMS = async (message: string) => {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Erreur', 'SMS non disponible');
      return;
    }
    if (contacts.length === 0) {
      Alert.alert('Aucun contact', "Ajoute d'abord des contacts.");
      return;
    }
    const numeros = contacts
      .map((c) => c.telephone || c.tel)
      .filter((n) => n && n.trim() !== '');
    await SMS.sendSMSAsync(numeros, message);
  };

  const envoyerAlerte = async () => {
    setEnvoiEnCours(true);
    let messageGPS = 'Localisation non disponible';
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          maximumAge: 5000,
          timeout: 3000,
        });
        const { latitude, longitude } = location.coords;
        messageGPS = `https://maps.google.com/?q=${latitude},${longitude}`;
      }
    } catch (error) {
      console.log(error);
    }
    const message = `🚨 ALERTE URGENTE !
Je suis en danger !
📍 Ma position : ${messageGPS}
Venez m'aider !
— ALERT'ELLE`;
    await envoyerSMS(message);
    setEnvoiEnCours(false);
  };

  const handleSOS = () => {
    compteur.current += 1;
    if (compteur.current === 3) {
      compteur.current = 0;
      envoyerAlerte();
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      compteur.current = 0;
    }, 2000);
  };

  return (
    <View style={styles.container}>

      {/* TOPBAR */}
      <View style={styles.topbar}>
        <View style={styles.topbarLeft}>
          <Text style={styles.bonjour}>Bonsoir,</Text>
          <Text style={styles.nom}>{nomUtilisateur} 👋</Text>
        </View>
        <Pressable
          style={styles.paramBtn}
          onPress={() =>
            Alert.alert('Paramètres', 'Que veux-tu faire ?', [
              { text: 'Inscription', onPress: () => router.push('/inscription') },
              { text: 'Connexion', onPress: () => router.push('/login') },
              { text: 'Déconnexion', onPress: deconnexion },
              { text: 'Annuler', style: 'cancel' },
            ])
          }
        >
          <Ionicons name="settings-outline" size={22} color="white" />
        </Pressable>
      </View>

      {/* ZONE SOS */}
      <View style={styles.sosZone}>
        <View style={styles.sosLabelContainer}>
          <Text style={styles.sosLabel}>APPUIE 3 FOIS POUR ALERTER</Text>
        </View>

        <View style={styles.sosPulseContainer}>
          <Animated.View style={[styles.pulseRing2, { transform: [{ scale: pulse2 }] }]} />
          <Animated.View style={[styles.pulseRing1, { transform: [{ scale: pulse1 }] }]} />
          <TouchableOpacity
            style={[styles.sosBtn, envoiEnCours && styles.sosBtnEnvoi]}
            onPress={handleSOS}
            activeOpacity={0.8}
          >
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubText}>
              {envoiEnCours ? 'ENVOI...' : 'ALERTER'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sosHint}>
          📍 Envoie ta position à tes contacts de confiance
        </Text>
      </View>

      {/* CARTES */}
      <View style={styles.cartes}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/explore')}>
          <Ionicons name="people-outline" size={28} color="#9333EA" />
          <Text style={styles.cardTitre}>Mes contacts</Text>
          <Text style={styles.cardSous}>{contacts.length} contact(s) actif(s)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Alert.alert(
              '📞 Urgences',
              'Police : 2720257964\nONG Bloom : +225 07 20 42 43 43\nMFFE : 1308'
            )
          }
        >
          <Ionicons name="call-outline" size={28} color="#9333EA" />
          <Text style={styles.cardTitre}>Urgences</Text>
          <Text style={styles.cardSous}>Police</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/journal')}>
          <Ionicons name="document-text-outline" size={28} color="#9333EA" />
          <Text style={styles.cardTitre}>Mon journal</Text>
          <Text style={styles.cardSous}>Documenter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/ressources')}>
          <Ionicons name="heart-outline" size={28} color="#9333EA" />
          <Text style={styles.cardTitre}>Centre d'aide</Text>
          <Text style={styles.cardSous}>Ressources</Text>
        </TouchableOpacity>
      </View>

      {/* NAVBAR PRO */}
      <View style={styles.navbar}>
        <TouchableOpacity style={[styles.navItem, styles.navActif]}>
          <View style={styles.navIconActif}>
            <Ionicons name="home" size={22} color="#9333EA" />
          </View>
          <Text style={[styles.navText, styles.navTextActif]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/explore')}>
          <Ionicons name="people-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/journal')}>
          <Ionicons name="book-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Journal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/ressources')}>
          <Ionicons name="heart-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Aide</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },

  topbar: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: (StatusBar.currentHeight || 0) + 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topbarLeft: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  bonjour: { fontSize: 12, color: '#6B7280' },
  nom: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  paramBtn: {
    backgroundColor: '#9333EA',
    width: 44,
    height: 44,
    borderRadius: 22,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sosZone: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#F3E8FF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
  },
  sosLabelContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  sosLabel: {
    fontSize: 12,
    color: '#9333EA',
    fontWeight: '600',
    letterSpacing: 1,
  },
  sosPulseContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing1: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  pulseRing2: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  sosBtn: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    elevation: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  sosBtnEnvoi: { backgroundColor: '#F97316' },
  sosText: { color: 'white', fontSize: 26, fontWeight: 'bold', letterSpacing: 2 },
  sosSubText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10, fontWeight: '600', letterSpacing: 2, marginTop: 2,
  },
  sosHint: { fontSize: 12, marginTop: 20, color: '#6B7280', textAlign: 'center' },

  cartes: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: 16, gap: 12,
  },
  card: {
    backgroundColor: '#fff', width: '47%',
    borderRadius: 20, padding: 20,
    marginBottom: 15, elevation: 5,
  },
  cardTitre: { fontWeight: 'bold', color: '#1E1B2E', marginTop: 8, fontSize: 16 },
  cardSous: { fontSize: 13, color: '#6B7280', marginTop: 4 },

  navbar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E9D5FF',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navActif: {},
  navIconActif: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 6,
  },
  navText: { fontSize: 10, color: '#6B7280' },
  navTextActif: { color: '#9333EA', fontWeight: 'bold' },
});