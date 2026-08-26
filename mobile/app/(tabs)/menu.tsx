import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Alert, ScrollView, Switch
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut, User, ShieldCheck, Info, ChevronRight,
  Bell, RefreshCw, Database
} from 'lucide-react-native';
import api from '../../utils/axiosConfig';

export default function MenuScreen() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('Logging out...');
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          } 
        },
      ]
    );
  };

  const handleRefreshData = async () => {
    try {
      await api.get('/api/inventory');
      Alert.alert('✅ Data Refreshed', 'Inventory data has been synced with the server.');
    } catch {
      Alert.alert('Error', 'Could not reach the server. Check your connection.');
    }
  };

  const handleCheckAlerts = async () => {
    try {
      const res = await api.get('/api/inventory/alerts');
      const count = res.data.length;
      if (count === 0) {
        Alert.alert('✅ All Good!', 'No medicines are below minimum stock levels.');
      } else {
        const names = res.data.map((m: any) => `• ${m.name} (${m.quantity} left)`).join('\n');
        Alert.alert(`⚠️ ${count} Low Stock Alert${count > 1 ? 's' : ''}`, names);
      }
    } catch {
      Alert.alert('Error', 'Could not fetch alerts.');
    }
  };

  const handleDbInfo = async () => {
    try {
      const [medsRes, txRes] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/inventory/transactions'),
      ]);
      Alert.alert(
        '📦 Database Info',
        `Total Medicines: ${medsRes.data.length}\nTotal Transactions: ${txRes.data.length}`
      );
    } catch {
      Alert.alert('Error', 'Could not fetch database info.');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.username?.[0] ?? 'U').toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{user?.username ?? 'User'}</Text>
            <View style={styles.roleBadge}>
              <ShieldCheck color={isAdmin ? '#f59e0b' : '#3b82f6'} size={14} style={{ marginRight: 5 }} />
              <Text style={[styles.roleText, { color: isAdmin ? '#f59e0b' : '#3b82f6' }]}>
                {isAdmin ? 'Administrator' : 'Pharmacist'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.section}>
          <MenuItem
            icon={<Bell color="#3b82f6" size={20} />}
            label="Check Low Stock Alerts"
            onPress={handleCheckAlerts}
          />
          <Divider />
          <MenuItem
            icon={<RefreshCw color="#10b981" size={20} />}
            label="Sync / Refresh Data"
            onPress={handleRefreshData}
          />
          <Divider />
          <MenuItem
            icon={<Database color="#a78bfa" size={20} />}
            label="Database Info"
            onPress={handleDbInfo}
          />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          <View style={styles.menuItemRow}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconWrap}>
                <Bell color="#f59e0b" size={20} />
              </View>
              <Text style={styles.menuLabel}>Low Stock Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#333', true: '#3b82f6' }}
              thumbColor={notifications ? '#fff' : '#888'}
            />
          </View>
        </View>

        {/* App Info */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App</Text>
            <Text style={styles.infoValue}>PHC Inventory System</Text>
          </View>
          <Divider />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <Divider />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Server</Text>
            <Text style={styles.infoValue}>localhost:5000</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut color="#f87171" size={20} style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItemRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconWrap}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <ChevronRight color="#555" size={18} />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 20, paddingBottom: 100 },

  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#222',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1f3460',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  avatarText: { color: '#3b82f6', fontSize: 28, fontWeight: '800' },
  username: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  roleBadge: { flexDirection: 'row', alignItems: 'center' },
  roleText: { fontSize: 14, fontWeight: '700' },

  // Sections
  sectionTitle: { color: '#555', fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  section: { backgroundColor: '#141414', borderRadius: 20, borderWidth: 1, borderColor: '#222', marginBottom: 24, overflow: 'hidden' },

  menuItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 18 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuLabel: { color: '#e0e0e0', fontSize: 15, fontWeight: '500' },

  divider: { height: 1, backgroundColor: '#1f1f1f', marginLeft: 68 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
  infoLabel: { color: '#888', fontSize: 14 },
  infoValue: { color: '#ccc', fontSize: 14, fontWeight: '600' },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    borderRadius: 18,
    paddingVertical: 18,
    marginTop: 4,
  },
  logoutText: { color: '#f87171', fontSize: 17, fontWeight: '700' },
});
