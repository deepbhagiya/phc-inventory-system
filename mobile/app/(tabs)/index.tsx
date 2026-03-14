import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import api from '../../utils/axiosConfig';
import { Package, AlertTriangle, Activity } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen() {
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [medsRes, alertsRes] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/inventory/alerts')
      ]);
      setMedicines(medsRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.log('Error fetching dashboard data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.username}>{user?.username || 'User'} 👋</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.card, styles.cardBlue]}>
          <View style={styles.cardHeader}>
            <Package color="#60a5fa" size={24} />
          </View>
          <Text style={styles.cardValue}>{medicines.length}</Text>
          <Text style={styles.cardTitle}>Total Stock Items</Text>
        </View>

        <View style={[styles.card, styles.cardRed]}>
          <View style={styles.cardHeader}>
            <AlertTriangle color="#f87171" size={24} />
          </View>
          <Text style={styles.cardValue}>{alerts.length}</Text>
          <Text style={[styles.cardTitle, { color: '#fca5a5' }]}>Low Stock Alerts</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Activity color="#888" size={20} />
          <Text style={styles.sectionTitle}>Overview Snapshot</Text>
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewText}>Keep your inventory healthy by reviewing low stock alerts regularly and tracking daily dispense metrics.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#888',
    marginBottom: 4,
  },
  username: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  cardBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  cardRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e0e0e0',
  },
  overviewCard: {
    backgroundColor: '#141414',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  overviewText: {
    color: '#999',
    fontSize: 15,
    lineHeight: 22,
  },
});
