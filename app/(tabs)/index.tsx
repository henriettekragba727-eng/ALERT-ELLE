import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';

export default function CalcScreen() {
  const [ecran, setEcran] = useState('0');
  const expression = useRef('');
  const saisie = useRef('');
  const codeSecret = '1234=';

  const appuyer = (valeur: string) => {
    if (valeur === 'C') {
      expression.current = '';
      saisie.current = '';
      setEcran('0');
      return;
    }

    expression.current += valeur;
    saisie.current += valeur;
    setEcran(expression.current);

    if (saisie.current.includes(codeSecret)) {
      saisie.current = '';
      expression.current = '';
      setEcran('0');
      router.replace('/(tabs)/sos');
    }
  };

  const calculer = () => {
    saisie.current += '=';

    if (saisie.current.includes(codeSecret)) {
      saisie.current = '';
      expression.current = '';
      setEcran('0');
      router.replace('/(tabs)/sos');
      return;
    }

    try {
      const resultat = eval(expression.current);
      setEcran(String(resultat));
      expression.current = String(resultat);
    } catch {
      setEcran('Erreur');
      expression.current = '';
    }
    saisie.current = '';
  };

  const Btn = ({ label, type = 'normal', span = false }: { label: string, type?: string, span?: boolean }) => (
    <TouchableOpacity
      style={[styles.btn, type === 'op' && styles.btnOp, type === 'special' && styles.btnSpecial, type === 'egal' && styles.btnEgal, span && styles.btnSpan]}
      onPress={() => label === '=' ? calculer() : appuyer(label)}
    >
      <Text style={[styles.btnText, type === 'op' && styles.btnTextOp, type === 'egal' && styles.btnTextEgal]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.ecran}>
        <Text style={styles.ecranText} numberOfLines={1} adjustsFontSizeToFit>{ecran}</Text>
      </View>

      <View style={styles.grille}>
        <Btn label="C" type="special" />
        <Btn label="+/-" type="special" />
        <Btn label="%" type="special" />
        <Btn label="÷" type="op" />

        <Btn label="7" />
        <Btn label="8" />
        <Btn label="9" />
        <Btn label="×" type="op" />

        <Btn label="4" />
        <Btn label="5" />
        <Btn label="6" />
        <Btn label="−" type="op" />

        <Btn label="1" />
        <Btn label="2" />
        <Btn label="3" />
        <Btn label="+" type="op" />

        <Btn label="0" span={true} />
        <Btn label="." />
        <Btn label="=" type="egal" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E', justifyContent: 'flex-end' },
  ecran: { padding: 24, alignItems: 'flex-end' },
  ecranText: { color: 'white', fontSize: 64, fontWeight: '200' },
  grille: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  btn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#333333', alignItems: 'center', justifyContent: 'center' },
  btnOp: { backgroundColor: '#FF9F0A' },
  btnSpecial: { backgroundColor: '#A5A5A5' },
  btnEgal: { backgroundColor: '#FF9F0A' },
  btnSpan: { width: 156 },
  btnText: { color: 'white', fontSize: 28, fontWeight: '400' },
  btnTextOp: { color: 'white' },
  btnTextEgal: { color: 'white' },
});