// ============================================================
// SafeGuard — Root App Entry
// Navigation setup: bottom tabs + stack navigator
// Auth: custom session check via src/lib/auth.ts (no Supabase)
// ============================================================

import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SOSScreen from './src/screens/SOSScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import LiveLocationScreen from './src/screens/LiveLocationScreen';
import FakeCallScreen from './src/screens/FakeCallScreen';
import JourneyScreen from './src/screens/JourneyScreen';
import SafeZoneScreen from './src/screens/SafeZoneScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import { colors } from './src/constants/theme';
import { getSession } from './src/lib/auth'; // ← custom auth, no Supabase

// ── Navigator types ──────────────────────────────────────────
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  SOS: undefined;
  LiveLocation: undefined;
  FakeCall: undefined;
  Journey: undefined;
  SafeZone: undefined;
};

export type TabParamList = {
  Home: undefined;
  Contacts: undefined;
  Community: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// ── Tab icon helper ──────────────────────────────────────────
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
  );
}

// ── Bottom Tabs ──────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          tabBarLabel: 'Home',
        }}
      >
        {(props) => <HomeScreen {...props} onLogin={() => {}} />}
      </Tab.Screen>

      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📞" focused={focused} />,
          tabBarLabel: 'Helplines',
        }}
      />

      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌍" focused={focused} />,
          tabBarLabel: 'Community',
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// ── Root App ─────────────────────────────────────────────────
export default function App() {
  // null = still checking, true/false = resolved
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Reads the persisted session created by auth.saveSession().
   * If a User object is found the app jumps straight to Main;
   * otherwise the Login screen is shown.
   */
  const checkSession = async () => {
    try {
      const user = await getSession();
      setIsLoggedIn(user !== null);
    } catch {
      setIsLoggedIn(false);
    }
  };

  // ── Splash / loading state ───────────────────────────────
  if (isLoggedIn === null) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '900' }}>
          🛡️ SafeGuard
        </Text>
      </View>
    );
  }

  // ── Main navigator ───────────────────────────────────────
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={colors.background} />

      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />

            <Stack.Screen name="SOS" options={{ presentation: 'modal' }}>
              {(props) => <SOSScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
            </Stack.Screen>

            <Stack.Screen name="LiveLocation">
              {(props) => <LiveLocationScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
            </Stack.Screen>

            <Stack.Screen name="FakeCall">
              {(props) => <FakeCallScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
            </Stack.Screen>

            <Stack.Screen name="Journey">
              {(props) => <JourneyScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
            </Stack.Screen>

            <Stack.Screen name="SafeZone">
              {(props) => <SafeZoneScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}