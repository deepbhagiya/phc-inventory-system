import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  SafeAreaView, TouchableOpacity
} from 'react-native';
import api from '../../utils/axiosConfig';
import { ArrowDownCircle, ArrowUpCircle, User, Stethoscope, Package } from 'lucide-react-native';

type Transaction = {
  id: number;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  patientContact?: string;
  doctorName?: string;
  referenceId?: string;
  transactionDate: string;
  createdAt: string;
  Medicine?: { name: string };
  medicine?: { name: string };
  User?: { username: string };
  user?: { username: string };
};

type GroupedEntry = {
  key: string;           // referenceId for OUT groups, id string for solo IN
  type: 'IN' | 'OUT';
  transactions: Transaction[];
  date: string;
  by: string;
  patientName?: string;
  patientGender?: string;
  doctorName?: string;
};

function groupTransactions(transactions: Transaction[]): GroupedEntry[] {
  const groups: Record<string, GroupedEntry> = {};

  transactions.forEach(t => {
    // Group OUT transactions that share a referenceId together
    if (t.type === 'OUT' && t.referenceId) {
      if (!groups[t.referenceId]) {
        groups[t.referenceId] = {
          key: t.referenceId,
          type: 'OUT',
          transactions: [],
          date: t.transactionDate || t.createdAt,
          by: t.User?.username || t.user?.username || '—',
          patientName: t.patientName,
          patientGender: t.patientGender,
          doctorName: t.doctorName,
        };
      }
      groups[t.referenceId].transactions.push(t);
    } else {
      // IN transactions or OUT without referenceId — show individually
      const key = `solo_${t.id}`;
      groups[key] = {
        key,
        type: t.type,
        transactions: [t],
        date: t.transactionDate || t.createdAt,
        by: t.User?.username || t.user?.username || '—',
      };
    }
  });

  // Sort by date descending
  return Object.values(groups).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/api/inventory/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.log('Error fetching transactions', err);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const grouped = groupTransactions(
    filter === 'ALL' ? transactions : transactions.filter(t => t.type === filter)
  );

  const renderItem = ({ item }: { item: GroupedEntry }) => {
    const isOut = item.type === 'OUT';
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const totalQty = item.transactions.reduce((sum, t) => sum + t.quantity, 0);

    return (
      <View style={[styles.card, isOut ? styles.cardOut : styles.cardIn]}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.iconWrap}>
            {isOut
              ? <ArrowUpCircle color="#f87171" size={26} />
              : <ArrowDownCircle color="#4ade80" size={26} />}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.headerTopRow}>
              <Text style={styles.typeLabel}>{isOut ? 'Issued to Patient' : 'Stock In'}</Text>
              <View style={[styles.badge, isOut ? styles.badgeOut : styles.badgeIn]}>
                <Text style={[styles.badgeText, isOut ? styles.badgeTextOut : styles.badgeTextIn]}>
                  {isOut ? `−${totalQty}` : `+${totalQty}`} total
                </Text>
              </View>
            </View>

            {/* Patient info for OUT */}
            {isOut && item.patientName && (
              <View style={styles.metaRow}>
                <User color="#888" size={13} style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{item.patientName}</Text>
                {item.patientGender ? <Text style={styles.metaDot}> ({item.patientGender})</Text> : null}
                {item.doctorName ? (
                  <>
                    <Text style={styles.metaDot}>  ·  </Text>
                    <Stethoscope color="#888" size={13} style={{ marginRight: 4 }} />
                    <Text style={styles.metaText}>Dr. {item.doctorName}</Text>
                  </>
                ) : null}
              </View>
            )}
          </View>
        </View>

        {/* Medicine list */}
        <View style={styles.medList}>
          {item.transactions.map(t => (
            <View key={t.id} style={styles.medRow}>
              <Package color="#555" size={13} style={{ marginRight: 6 }} />
              <Text style={styles.medRowName}>{t.Medicine?.name || t.medicine?.name || t.reason || 'Unknown Medicine'}</Text>
              <Text style={[styles.medRowQty, isOut ? styles.medRowQtyOut : styles.medRowQtyIn]}>
                {isOut ? `−${t.quantity}` : `+${t.quantity}`}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>by {item.by}</Text>
          <Text style={styles.footerText}>{dateStr} · {timeStr}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {(['ALL', 'OUT', 'IN'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
              {f === 'ALL' ? 'All' : f === 'OUT' ? '🔴 Issued' : '🟢 Restocked'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={grouped}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' },
  filterBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  filterBtnText: { color: '#888', fontSize: 13, fontWeight: '600' },
  filterBtnTextActive: { color: '#fff' },

  list: { paddingHorizontal: 16, paddingBottom: 100 },

  card: { backgroundColor: '#141414', borderRadius: 20, marginBottom: 14, borderWidth: 1, overflow: 'hidden' },
  cardIn: { borderColor: 'rgba(74,222,128,0.25)' },
  cardOut: { borderColor: 'rgba(248,113,113,0.25)' },

  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, paddingBottom: 10 },
  iconWrap: { marginRight: 12, marginTop: 2 },

  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  typeLabel: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },

  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeOut: { backgroundColor: 'rgba(248,113,113,0.15)' },
  badgeIn: { backgroundColor: 'rgba(74,222,128,0.15)' },
  badgeText: { fontSize: 13, fontWeight: '800' },
  badgeTextOut: { color: '#f87171' },
  badgeTextIn: { color: '#4ade80' },

  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  metaText: { color: '#999', fontSize: 13 },
  metaDot: { color: '#666', fontSize: 13 },

  // Medicines list inside the card
  medList: { borderTopWidth: 1, borderTopColor: '#1f1f1f', paddingHorizontal: 16, paddingVertical: 10 },
  medRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  medRowName: { flex: 1, color: '#ccc', fontSize: 14 },
  medRowQty: { fontSize: 14, fontWeight: '700' },
  medRowQtyOut: { color: '#f87171' },
  medRowQtyIn: { color: '#4ade80' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1f1f1f' },
  footerText: { color: '#555', fontSize: 12 },

  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { color: '#555', fontSize: 16 },
});
