import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#9333EA',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
  display: 'none',
          
          
          
          
        
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'CalcPro',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="journal"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="ressources"
        options={{ href: null }}
      />
    </Tabs>
  );
}