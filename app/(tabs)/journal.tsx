import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Alert, TextInput, Modal, Image,
} from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  AudioModule, RecordingPresets, setAudioModeAsync,
  useAudioRecorder, useAudioRecorderState, useAudioPlayer,
} from 'expo-audio';

const response = await fetch('https://calcpro.allons-y.ci/journal.php', {
const UTILISATRICE_ID = 1;

export default function JournalScreen() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [titre, setTitre] = useState('');
  const [heure, setHeure] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const audioPlayer = useAudioPlayer(null);

  const chargerIncidentsDepuisAPI = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/journal.php?utilisatrice_id=${UTILISATRICE_ID}`);
      const data = await response.json();
      if (data.statut === 'succes') {
        const incidentsFormates = data.incidents.map((incident: any) => ({
          id: Number(incident.id),
          titre: incident.titre,
          heure: new Date(incident.date_incident).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(incident.date_incident).toLocaleDateString('fr-FR'),
          description: incident.description,
          photo: incident.photo || null,
          audio: incident.audio || null,
        }));
        setIncidents(incidentsFormates);
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de charger le journal.');
      }
    } catch (error) {
      console.log('Erreur chargement journal API:', error);
      Alert.alert('Erreur réseau', "Impossible de récupérer les incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { chargerIncidentsDepuisAPI(); }, []);

  useEffect(() => {
    const preparerAudio = async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert('Permission refusée', 'Autorise le micro pour enregistrer un audio.');
          return;
        }
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      } catch (error) {
        console.log('Erreur permission audio:', error);
      }
    };
    preparerAudio();
  }, []);

  const ouvrirFormulaire = () => {
    setTitre(''); setHeure(''); setDate(''); setDescription(''); setPhoto(null); setAudio(null);
    setModalVisible(true);
  };

  const prendrePhotoCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) { Alert.alert('Permission refusée', "L'accès à la caméra a été refusé."); return; }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
      if (!result.canceled) { setPhoto(result.assets[0].uri); Alert.alert('✅ Photo ajoutée'); }
    } catch (error) { Alert.alert('Erreur', "Impossible d'ouvrir la caméra."); }
  };

  const choisirPhotoGalerie = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { Alert.alert('Permission refusée', "L'accès à la galerie a été refusé."); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
      if (!result.canceled) { setPhoto(result.assets[0].uri); Alert.alert('✅ Photo ajoutée'); }
    } catch (error) { Alert.alert('Erreur', "Impossible d'ouvrir la galerie."); }
  };

  const ajouterPhoto = () => {
    Alert.alert('Ajouter une photo', 'Choisis une méthode', [
      { text: '📷 Prendre une photo', onPress: () => prendrePhotoCamera() },
      { text: '🖼️ Depuis la galerie', onPress: () => choisirPhotoGalerie() },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const commencerAudio = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) { Alert.alert('Erreur', "Impossible de démarrer l'enregistrement."); }
  };

  const arreterAudio = async () => {
    try {
      await audioRecorder.stop();
      const audioUri = audioRecorder.uri;
      if (audioUri) { setAudio(audioUri); Alert.alert('✅ Audio ajouté'); }
      else { Alert.alert('Erreur', "L'audio n'a pas pu être récupéré."); }
    } catch (error) { Alert.alert('Erreur', "Impossible d'arrêter l'enregistrement."); }
  };

  const handleAudio = async () => {
    if (recorderState.isRecording) await arreterAudio();
    else await commencerAudio();
  };

  const lireAudio = async (uri: string | null) => {
    try {
      if (!uri) { Alert.alert('🎤 Audio', 'Aucun audio joint.'); return; }
      audioPlayer.replace({ uri });
      audioPlayer.seekTo(0);
      audioPlayer.play();
    } catch (error) { Alert.alert('Erreur', "Impossible de lire l'audio."); }
  };

  const supprimerAudioFormulaire = () => { setAudio(null); Alert.alert('🗑️ Audio supprimé'); };

  const enregistrerIncident = async () => {
    if (!titre || !description) { Alert.alert('⚠️ Erreur', 'Remplis au moins le titre et la description.'); return; }
    try {
      const dateIncidentFinale = date
        ? date.split('/').reverse().join('-') + ' ' + (heure || '00:00')
        : new Date().toISOString().slice(0, 19).replace('T', ' ');

      const response = await fetch(`${API_URL}/journal.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utilisatrice_id: UTILISATRICE_ID, titre, description, date_incident: dateIncidentFinale, photo, audio }),
      });
      const data = await response.json();
      if (data.statut === 'succes') {
        setTitre(''); setHeure(''); setDate(''); setDescription(''); setPhoto(null); setAudio(null);
        setModalVisible(false);
        Alert.alert('✅ Incident enregistré');
        chargerIncidentsDepuisAPI();
      } else {
        Alert.alert('Erreur', data.message || "Impossible d'enregistrer l'incident.");
      }
    } catch (error) { Alert.alert('Erreur réseau', "Impossible d'enregistrer l'incident."); }
  };

  const supprimerIncident = (id: number) => {
    Alert.alert('🗑️ Supprimer', 'Tu veux supprimer cet incident ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/journal.php`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, utilisatrice_id: 1 }),
            });
            const data = await response.json();
            if (data.statut === 'succes') { Alert.alert('✅ Supprimé'); chargerIncidentsDepuisAPI(); }
            else { Alert.alert('Erreur', data.message); }
          } catch (error) { Alert.alert('Erreur réseau'); }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.retourBtn}>
          <Text style={styles.retourText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitre}>📒 Mon Journal</Text>
        <Text style={styles.headerSous}>Documente les incidents en toute sécurité</Text>
      </View>

      <ScrollView>
        {loading && <View style={styles.emptyBox}><Text style={styles.emptyText}>Chargement du journal...</Text></View>}
        {!loading && incidents.length === 0 && <View style={styles.emptyBox}><Text style={styles.emptyText}>Aucun incident enregistré pour le moment.</Text></View>}

        <View style={styles.liste}>
          {incidents.map((incident: any) => (
            <TouchableOpacity key={incident.id} style={styles.card} onLongPress={() => supprimerIncident(incident.id)}>
              <View style={styles.cardTop}>
                <Text style={styles.incidentTitre}>{incident.titre}</Text>
                <View style={styles.dateBadge}><Text style={styles.dateBadgeText}>{incident.date}</Text></View>
              </View>
              <Text style={styles.heure}>🕘 {incident.heure}</Text>
              <Text style={styles.description}>{incident.description}</Text>
              {incident.photo && <Image source={{ uri: incident.photo }} style={styles.photoPreview} />}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBadge} onPress={() => Alert.alert('📸 Photo', incident.photo ? 'Une photo est jointe.' : 'Aucune photo jointe.')}>
                  <Text style={styles.actionText}>📸 Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBadge} onPress={() => lireAudio(incident.audio)}>
                  <Text style={styles.actionText}>{incident.audio ? '▶️ Audio' : '🎤 Audio'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.ajouterBtn} onPress={ouvrirFormulaire}>
          <Text style={styles.ajouterText}>＋ Documenter un incident</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>💡 Appui long sur un incident pour le supprimer</Text>
        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitre}>➕ Nouvel incident</Text>
            <TextInput style={styles.input} placeholder="Titre de l'incident" value={titre} onChangeText={setTitre} placeholderTextColor="#9CA3AF" />
            <TextInput style={styles.input} placeholder="Heure (ex: 22:30)" value={heure} onChangeText={setHeure} placeholderTextColor="#9CA3AF" />
            <TextInput style={styles.input} placeholder="Date (ex: 21/04/2026)" value={date} onChangeText={setDate} placeholderTextColor="#9CA3AF" />
            <TextInput style={[styles.input, styles.textarea]} placeholder="Décris l'incident" value={description} onChangeText={setDescription} multiline placeholderTextColor="#9CA3AF" />
            <TouchableOpacity style={styles.photoBtn} onPress={ajouterPhoto}>
              <Text style={styles.photoBtnText}>{photo ? '✅ Photo ajoutée' : '📸 Ajouter une photo'}</Text>
            </TouchableOpacity>
            {photo && <Image source={{ uri: photo }} style={styles.modalPhotoPreview} />}
            <TouchableOpacity style={[styles.audioBtn, recorderState.isRecording && styles.audioBtnStop]} onPress={handleAudio}>
              <Text style={styles.audioBtnText}>
                {recorderState.isRecording ? '⏹ Arrêter audio' : audio ? '✅ Audio ajouté' : '🎤 Enregistrer un audio'}
              </Text>
            </TouchableOpacity>
            {audio && (
              <View style={styles.audioActionsRow}>
                <TouchableOpacity style={styles.audioPlayBtn} onPress={() => lireAudio(audio)}>
                  <Text style={styles.audioSmallBtnText}>▶️ Écouter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.audioDeleteBtn} onPress={supprimerAudioFormulaire}>
                  <Text style={styles.audioSmallBtnText}>🗑 Supprimer</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.sauverBtn} onPress={enregistrerIncident}>
              <Text style={styles.sauverText}>💾 Sauvegarder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.annulerBtn} onPress={() => { setModalVisible(false); setTitre(''); setHeure(''); setDate(''); setDescription(''); setPhoto(null); setAudio(null); }}>
              <Text style={styles.annulerText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ✅ NAVBAR PRO */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/sos')}>
          <Ionicons name="home-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/explore')}>
          <Ionicons name="people-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.navActif]}>
          <View style={styles.navIconActif}>
            <Ionicons name="book" size={22} color="#9333EA" />
          </View>
          <Text style={[styles.navText, styles.navTextActif]}>Journal</Text>
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
  retourText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitre: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  headerSous: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 },
  emptyBox: { padding: 16, paddingBottom: 0 },
  emptyText: { textAlign: 'center', color: '#6B7280', fontSize: 12 },
  liste: { padding: 16, gap: 10 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E9D5FF', marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  incidentTitre: { fontSize: 14, fontWeight: 'bold', color: '#1E1B2E', maxWidth: '65%' },
  dateBadge: { backgroundColor: '#E9D5FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  dateBadgeText: { color: '#6B21A8', fontSize: 11, fontWeight: 'bold' },
  heure: { color: '#6B7280', fontSize: 12, marginTop: 8 },
  description: { color: '#1E1B2E', fontSize: 13, marginTop: 10, lineHeight: 20 },
  photoPreview: { width: '100%', height: 160, borderRadius: 12, marginTop: 12 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  actionText: { color: '#6B21A8', fontSize: 12, fontWeight: '500' },
  ajouterBtn: { margin: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C4B5FD', borderRadius: 16, padding: 14, alignItems: 'center', backgroundColor: 'white' },
  ajouterText: { color: '#9333EA', fontSize: 13, fontWeight: 'bold' },
  hint: { textAlign: 'center', color: '#9CA3AF', fontSize: 11, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitre: { fontSize: 16, fontWeight: 'bold', color: '#6B21A8', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E9D5FF', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 12, color: '#1E1B2E' },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  photoBtn: { backgroundColor: '#F3E8FF', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 12 },
  photoBtnText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 13 },
  modalPhotoPreview: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12 },
  audioBtn: { backgroundColor: '#A855F7', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 12 },
  audioBtnStop: { backgroundColor: '#DC2626' },
  audioBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  audioActionsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  audioPlayBtn: { flex: 1, backgroundColor: '#7C3AED', borderRadius: 12, padding: 12, alignItems: 'center' },
  audioDeleteBtn: { flex: 1, backgroundColor: '#6B7280', borderRadius: 12, padding: 12, alignItems: 'center' },
  audioSmallBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  sauverBtn: { backgroundColor: '#9333EA', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 8 },
  sauverText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  annulerBtn: { alignItems: 'center', padding: 8 },
  annulerText: { color: '#6B7280', fontSize: 14 },
  navbar: { backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E9D5FF', flexDirection: 'row', paddingVertical: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navActif: {},
  navIconActif: { backgroundColor: '#F3E8FF', borderRadius: 12, padding: 6 },
  navText: { fontSize: 10, color: '#6B7280' },
  navTextActif: { color: '#9333EA', fontWeight: 'bold' },
});