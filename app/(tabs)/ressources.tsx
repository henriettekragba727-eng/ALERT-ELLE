import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RessourcesScreen() {
  const ressources = [
    { id: 1, icon: '🚨', titre: 'Police Secours', info: "Appel d'urgence · 24h/24", numero: '2720257964', couleur: '#FEF2F2', bordure: '#FECACA', texte: '#DC2626' },
    { id: 2, icon: '💜', titre: 'ONG Bloom', info: 'Allô Bloom · VBG · 24h/24 · 7j/7', numero: '+22507204343', couleur: '#F3E8FF', bordure: '#E9D5FF', texte: '#7C3AED' },
    { id: 3, icon: '👩‍⚖️', titre: 'Ministère Femme CI', info: 'MFFE · Violences basées sur le genre', numero: '1308', couleur: '#FCE7F3', bordure: '#FBCFE8', texte: '#BE185D' },
    { id: 4, icon: '⚖️', titre: 'Aide juridique gratuite', info: 'Droits des femmes · Déposer une plainte', numero: '1308', couleur: '#ECFDF5', bordure: '#A7F3D0', texte: '#059669' },
    { id: 5, icon: '💬', titre: 'Soutien psychologique', info: 'Écoute et accompagnement des victimes', numero: '+22507204343', couleur: '#EFF6FF', bordure: '#BFDBFE', texte: '#2563EB' },
  ];

  const appeler = (numero: string) => {
    Linking.openURL(`tel:${numero}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: 'white', fontSize: 26, marginBottom: 5 }}>⬅️</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitre}>💜 Centre d'aide</Text>
          <Text style={styles.headerSous}>Ressources VBG disponibles en Côte d'Ivoire</Text>
        </View>

        <View style={styles.liste}>
          {ressources.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.card, { backgroundColor: r.couleur, borderColor: r.bordure }]}
              onPress={() => appeler(r.numero)}
            >
              <Text style={styles.cardIcon}>{r.icon}</Text>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitre, { color: r.texte }]}>{r.titre}</Text>
                <Text style={styles.cardSous}>{r.info}</Text>
                <Text style={[styles.cardNumero, { color: r.texte }]}>📞 {r.numero}</Text>
              </View>
              <Text style={[styles.appelerBtn, { color: r.texte }]}>Appeler →</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>⚠️ En cas de danger immédiat, appuie sur le bouton SOS dans l'onglet Accueil !</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

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

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/journal')}>
          <Ionicons name="book-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Journal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.navActif]}>
          <View style={styles.navIconActif}>
            <Ionicons name="heart" size={22} color="#9333EA" />
          </View>
          <Text style={[styles.navText, styles.navTextActif]}>Aide</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  header: { backgroundColor: '#6B21A8', padding: 20 },
  headerTitre: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  headerSous: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 },
  liste: { padding: 16, gap: 10 },
  card: { borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, marginBottom: 10 },
  cardIcon: { fontSize: 28 },
  cardInfo: { flex: 1 },
  cardTitre: { fontSize: 14, fontWeight: 'bold' },
  cardSous: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  cardNumero: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  appelerBtn: { fontSize: 12, fontWeight: 'bold' },
  noteBox: { margin: 16, backgroundColor: '#FEF3C7', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#FDE68A' },
  noteText: { color: '#92400E', fontSize: 12, lineHeight: 18, textAlign: 'center' },

  // ✅ NAVBAR PRO
  navbar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E9D5FF',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navActif: {},
  navIconActif: { backgroundColor: '#F3E8FF', borderRadius: 12, padding: 6 },
  navText: { fontSize: 10, color: '#6B7280' },
  navTextActif: { color: '#9333EA', fontWeight: 'bold' },
});