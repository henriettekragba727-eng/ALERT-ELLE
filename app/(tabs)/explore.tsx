import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://calcpro.allons-y.ci';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nom, setNom] = useState('');
  const [role, setRole] = useState('');
  const [tel, setTel] = useState('');
  const [loading, setLoading] = useState(false);
  const [utilisatriceId, setUtilisatriceId] = useState<number | null>(null);

  const couleurs = ['#9333EA', '#F472B6', '#6B21A8', '#EC4899', '#8B5CF6'];

  useEffect(() => {
    const chargerId = async () => {
      const id = await AsyncStorage.getItem('utilisatrice_id');
      if (id) setUtilisatriceId(Number(id));
    };
    chargerId();
  }, []);

  useEffect(() => {
    if (utilisatriceId) chargerContacts();
  }, [utilisatriceId]);

  const reponseOk = (data: any) => data.status === 'succes' || data.statut === 'succes';

  const chargerContacts = async () => {
    if (!utilisatriceId) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/contacts.php?utilisatrice_id=${utilisatriceId}`);
      const data = await response.json();
      if (reponseOk(data)) {
        const liste = data.contacts || [];
        const contactsAvecCouleur = liste.map((c: any, index: number) => ({
          id: Number(c.id),
          nom: c.nom,
          role: c.role || 'Contact',
          tel: c.telephone,
          couleur: couleurs[index % couleurs.length],
        }));
        setContacts(contactsAvecCouleur);
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de charger les contacts.');
      }
    } catch (error) {
      console.log('Erreur chargement contacts:', error);
      Alert.alert('Erreur réseau', "Impossible de récupérer les contacts.");
    } finally {
      setLoading(false);
    }
  };

  const ouvrirChoixAjout = () => {
    Alert.alert('Ajouter un contact', 'Choisis une méthode', [
      { text: 'Depuis mes contacts', onPress: importerDepuisTelephone },
      { text: 'Saisir manuellement', onPress: () => { setNom(''); setRole(''); setTel(''); setModalVisible(true); } },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const importerDepuisTelephone = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', "L'accès aux contacts a été refusé.");
        return;
      }
      const contact = await Contacts.presentContactPickerAsync();
      if (!contact) return;
      const nomImporte = contact.name || `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();
      const numeroImporte = contact.phoneNumbers && contact.phoneNumbers.length > 0
        ? contact.phoneNumbers[0].number || contact.phoneNumbers[0].digits || ''
        : '';
      if (!numeroImporte) {
        Alert.alert('Erreur', "Ce contact n'a pas de numéro de téléphone.");
        return;
      }
      setNom(nomImporte);
      setTel(numeroImporte);
      setRole('');
      setModalVisible(true);
    } catch (error) {
      console.log('Erreur import contact:', error);
      Alert.alert('Erreur', "Impossible d'importer le contact.");
    }
  };

  const ajouterContact = async () => {
    const nomFinal = nom.trim();
    const telFinal = tel.trim();
    const roleFinal = role.trim() || 'Contact';
    if (!utilisatriceId) {
      Alert.alert('Erreur', "Reconnecte-toi avant d'ajouter un contact.");
      return;
    }
    if (!nomFinal || !telFinal) {
      Alert.alert('Erreur', 'Nom et numéro obligatoires.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/contacts.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utilisatrice_id: utilisatriceId, nom: nomFinal, telephone: telFinal, role: roleFinal }),
      });
      const data = await response.json();
      if (reponseOk(data)) {
        setNom(''); setRole(''); setTel('');
        setModalVisible(false);
        Alert.alert('Contact ajouté', `${nomFinal} a été ajouté avec succès.`);
        chargerContacts();
      } else {
        Alert.alert('Erreur', data.message || "Impossible d'ajouter le contact.");
      }
    } catch (error) {
      console.log('Erreur ajout contact:', error);
      Alert.alert('Erreur réseau', "Impossible d'ajouter le contact.");
    }
  };

  const supprimerContact = (id: number) => {
    if (!utilisatriceId) return;
    Alert.alert('Supprimer', 'Tu veux supprimer ce contact ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/contacts.php`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, utilisatrice_id: utilisatriceId }),
            });
            const data = await response.json();
            if (reponseOk(data)) {
              Alert.alert('Supprimé', 'Contact supprimé avec succès.');
              chargerContacts();
            } else {
              Alert.alert('Erreur', data.message || 'Suppression impossible.');
            }
          } catch (error) {
            console.log('Erreur suppression:', error);
            Alert.alert('Erreur réseau', 'Impossible de supprimer ce contact.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/sos')} style={styles.retourBtn}>
          <Text style={styles.retourText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitre}>👥 Mes contacts de confiance</Text>
        <Text style={styles.headerSous}>Alertés automatiquement en cas de SOS</Text>
      </View>

      <ScrollView>
        {!loading && contacts.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Aucun contact de confiance. Ajoute tes propres contacts.</Text>
          </View>
        )}
        {loading && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Chargement des contacts...</Text>
          </View>
        )}
        <View style={styles.liste}>
          {contacts.map((c) => (
            <TouchableOpacity key={c.id} style={styles.card} onLongPress={() => supprimerContact(c.id)}>
              <View style={[styles.avatar, { backgroundColor: c.couleur }]}>
                <Text style={styles.avatarText}>{c.nom.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.nom}>{c.nom}</Text>
                <Text style={styles.role}>{c.role}</Text>
                <Text style={styles.tel}>{c.tel}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Actif</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.ajouterBtn} onPress={ouvrirChoixAjout}>
          <Text style={styles.ajouterText}>＋ Ajouter un contact de confiance</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>💡 Appui long sur un contact pour le supprimer</Text>
        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitre}>➕ Nouveau contact</Text>
            <TextInput style={styles.input} placeholder="Nom complet" value={nom} onChangeText={setNom} placeholderTextColor="#9CA3AF" />
            <TextInput style={styles.input} placeholder="Relation" value={role} onChangeText={setRole} placeholderTextColor="#9CA3AF" />
            <TextInput style={styles.input} placeholder="Numéro" value={tel} onChangeText={setTel} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />
            <TouchableOpacity style={styles.sauverBtn} onPress={ajouterContact}>
              <Text style={styles.sauverText}>💾 Sauvegarder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.annulerBtn} onPress={() => { setModalVisible(false); setNom(''); setRole(''); setTel(''); }}>
              <Text style={styles.annulerText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/sos')}>
          <Ionicons name="home-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.navActif]}>
          <View style={styles.navIconActif}>
            <Ionicons name="people" size={22} color="#9333EA" />
          </View>
          <Text style={[styles.navText, styles.navTextActif]}>Contacts</Text>
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
  header: { backgroundColor: '#6B21A8', padding: 16 },
  retourBtn: { marginBottom: 8 },
  retourText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  headerTitre: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  headerSous: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 },
  emptyBox: { padding: 16, paddingBottom: 0 },
  emptyText: { textAlign: 'center', color: '#6B7280', fontSize: 12 },
  liste: { padding: 16, gap: 10 },
  card: {
    backgroundColor: 'white', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#E9D5FF', marginBottom: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  info: { flex: 1 },
  nom: { fontSize: 14, fontWeight: 'bold', color: '#1E1B2E' },
  role: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  tel: { fontSize: 11, color: '#9333EA', marginTop: 2 },
  badge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: '#16A34A', fontSize: 10, fontWeight: 'bold' },
  ajouterBtn: {
    margin: 16, borderWidth: 2, borderStyle: 'dashed',
    borderColor: '#C4B5FD', borderRadius: 16, padding: 14,
    alignItems: 'center', backgroundColor: 'white',
  },
  ajouterText: { color: '#9333EA', fontSize: 13, fontWeight: 'bold' },
  hint: { textAlign: 'center', color: '#9CA3AF', fontSize: 11, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitre: { fontSize: 16, fontWeight: 'bold', color: '#6B21A8', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E9D5FF', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 12, color: '#1E1B2E' },
  sauverBtn: { backgroundColor: '#9333EA', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 8 },
  sauverText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  annulerBtn: { alignItems: 'center', padding: 8 },
  annulerText: { color: '#6B7280', fontSize: 14 },
  navbar: {
    backgroundColor: 'white', borderTopWidth: 1,
    borderTopColor: '#E9D5FF', flexDirection: 'row', paddingVertical: 10,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navActif: {},
  navIconActif: { backgroundColor: '#F3E8FF', borderRadius: 12, padding: 6 },
  navText: { fontSize: 10, color: '#6B7280' },
  navTextActif: { color: '#9333EA', fontWeight: 'bold' },
});