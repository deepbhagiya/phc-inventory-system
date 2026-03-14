import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  RefreshControl, Alert, SafeAreaView, Modal, ScrollView, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import api from '../../utils/axiosConfig';

import { PackagePlus, Search, Calendar, Package, X, Plus, ChevronDown } from 'lucide-react-native';

type Medicine = {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  minStockLevel: number;
  Supplier?: { id: number; name: string };
};

type Supplier = { id: number; name: string };

const UNITS = ['tablets', 'capsules', 'ml', 'mg', 'vials', 'sachets', 'syrup', 'injection'];

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Restock modal
  const [restockModal, setRestockModal] = useState<{ visible: boolean; med: Medicine | null }>({ visible: false, med: null });
  const [restockQty, setRestockQty] = useState('');
  const [restocking, setRestocking] = useState(false);

  // Add Medicine modal
  const [addModal, setAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: 'tablets',
    expiryDate: '',
    minStockLevel: '10',
    supplierId: '',
  });
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const fetchAll = async () => {
    try {
      const [medsRes, suppRes] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/suppliers'),
      ]);
      setMedicines(medsRes.data);
      setSuppliers(suppRes.data);
    } catch (err) {
      console.log('Error fetching data', err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  // ── Restock ──────────────────────────────────────────────
  const openRestock = (med: Medicine) => { setRestockQty(''); setRestockModal({ visible: true, med }); };
  const closeRestock = () => { setRestockModal({ visible: false, med: null }); setRestockQty(''); };

  const confirmRestock = async () => {
    const qty = Number(restockQty);
    if (!restockQty || isNaN(qty) || qty <= 0) { Alert.alert('Invalid', 'Enter a valid quantity.'); return; }
    setRestocking(true);
    try {
      await api.put(`/api/inventory/${restockModal.med!.id}/stock`, { type: 'IN', quantity: qty, reason: 'Standard Restock' });
      closeRestock();
      await fetchAll();
      Alert.alert('Success', `${qty} units added to ${restockModal.med!.name}.`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.msg || err.response?.data?.message || 'Failed.');
    } finally { setRestocking(false); }
  };

  // ── Add Medicine ─────────────────────────────────────────
  const openAddModal = () => {
    setNewMed({ name: '', description: '', quantity: '', unit: 'tablets', expiryDate: '', minStockLevel: '10', supplierId: suppliers[0]?.id?.toString() || '' });
    setAddModal(true);
  };

  const handleAddMedicine = async () => {
    if (!newMed.name.trim()) { Alert.alert('Required', 'Medicine name is required.'); return; }
    if (!newMed.quantity || isNaN(Number(newMed.quantity)) || Number(newMed.quantity) <= 0) { Alert.alert('Required', 'Enter a valid initial quantity.'); return; }
    if (!newMed.expiryDate.trim()) { Alert.alert('Required', 'Expiry date is required (YYYY-MM-DD).'); return; }

    setAdding(true);
    try {
      await api.post('/api/inventory', {
        name: newMed.name.trim(),
        description: newMed.description.trim(),
        quantity: parseInt(newMed.quantity, 10),
        unit: newMed.unit,
        expiryDate: newMed.expiryDate.trim(),
        minStockLevel: parseInt(newMed.minStockLevel || '10', 10),
        supplierId: newMed.supplierId ? parseInt(newMed.supplierId, 10) : null,
      });
      setAddModal(false);
      await fetchAll();
      Alert.alert('✅ Added', `${newMed.name} has been added to inventory.`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.msg || err.response?.data?.message || err.message || 'Failed to add medicine.');
    } finally { setAdding(false); }
  };

  const filteredMeds = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const renderItem = ({ item }: { item: Medicine }) => {
    const isLow = item.quantity <= item.minStockLevel;
    return (
      <View style={[styles.card, isLow && styles.cardLow]}>
        <View style={styles.cardInfo}>
          <Text style={styles.medName}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Calendar color="#666" size={13} style={{ marginRight: 5 }} />
            <Text style={styles.medDesc}>Exp: {new Date(item.expiryDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Package color="#666" size={13} style={{ marginRight: 5 }} />
            <Text style={styles.medDesc}>Min: {item.minStockLevel} {item.unit}</Text>
          </View>
          <View style={styles.stockBadge}>
            <Text style={isLow ? styles.stockRed : styles.stockGreen}>{item.quantity} in stock</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.restockButton} onPress={() => openRestock(item)} activeOpacity={0.8}>
          <PackagePlus color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Search color="#888" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Inventory..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredMeds}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No medicines found.</Text>}
      />

      {/* ── FAB: Add New Medicine ── */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: 20 + insets.bottom }]} 
        onPress={openAddModal} 
        activeOpacity={0.85}
      >
        <Plus color="#fff" size={28} />
      </TouchableOpacity>


      {/* ── Restock Modal ── */}
      <Modal visible={restockModal.visible} transparent animationType="fade" onRequestClose={closeRestock}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Restock</Text>
              <TouchableOpacity onPress={closeRestock}><X color="#888" size={22} /></TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Adding to: <Text style={{ color: '#3b82f6' }}>{restockModal.med?.name}</Text></Text>
            <TextInput style={styles.modalInput} placeholder="Quantity" placeholderTextColor="#666" keyboardType="number-pad" value={restockQty} onChangeText={setRestockQty} autoFocus />
            <View style={styles.rowBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeRestock}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, restocking && { opacity: 0.6 }]} onPress={confirmRestock} disabled={restocking}>
                <Text style={styles.primaryBtnText}>{restocking ? 'Adding...' : 'Restock'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Add Medicine Modal ── */}
      <Modal visible={addModal} transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.addModalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Medicine</Text>
              <TouchableOpacity onPress={() => setAddModal(false)}><X color="#888" size={22} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Medicine Name *</Text>
              <TextInput style={styles.formInput} placeholder="e.g. Ibuprofen 400mg" placeholderTextColor="#555" value={newMed.name} onChangeText={t => setNewMed({ ...newMed, name: t })} />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput style={[styles.formInput, { height: 72, textAlignVertical: 'top', paddingTop: 12 }]} placeholder="Optional description" placeholderTextColor="#555" multiline value={newMed.description} onChangeText={t => setNewMed({ ...newMed, description: t })} />

              <Text style={styles.fieldLabel}>Initial Quantity *</Text>
              <TextInput style={styles.formInput} placeholder="e.g. 100" placeholderTextColor="#555" keyboardType="number-pad" value={newMed.quantity} onChangeText={t => setNewMed({ ...newMed, quantity: t })} />

              <Text style={styles.fieldLabel}>Unit *</Text>
              <TouchableOpacity style={styles.unitPicker} onPress={() => setShowUnitPicker(!showUnitPicker)}>
                <Text style={{ color: '#fff', fontSize: 15 }}>{newMed.unit}</Text>
                <ChevronDown color="#888" size={18} />
              </TouchableOpacity>
              {showUnitPicker && (
                <View style={styles.unitDropdown}>
                  {UNITS.map(u => (
                    <TouchableOpacity key={u} style={styles.unitOption} onPress={() => { setNewMed({ ...newMed, unit: u }); setShowUnitPicker(false); }}>
                      <Text style={[styles.unitOptionText, newMed.unit === u && { color: '#3b82f6', fontWeight: '700' }]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.fieldLabel}>Expiry Date * (YYYY-MM-DD)</Text>
              <TextInput style={styles.formInput} placeholder="e.g. 2027-12-31" placeholderTextColor="#555" value={newMed.expiryDate} onChangeText={t => setNewMed({ ...newMed, expiryDate: t })} />

              <Text style={styles.fieldLabel}>Min Stock Level</Text>
              <TextInput style={styles.formInput} placeholder="Default: 10" placeholderTextColor="#555" keyboardType="number-pad" value={newMed.minStockLevel} onChangeText={t => setNewMed({ ...newMed, minStockLevel: t })} />

              {suppliers.length > 0 && (
                <>
                  <Text style={styles.fieldLabel}>Supplier</Text>
                  <View style={styles.unitDropdown}>
                    {suppliers.map(s => (
                      <TouchableOpacity key={s.id} style={styles.unitOption} onPress={() => setNewMed({ ...newMed, supplierId: s.id.toString() })}>
                        <Text style={[styles.unitOptionText, newMed.supplierId === s.id.toString() && { color: '#3b82f6', fontWeight: '700' }]}>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <TouchableOpacity style={[styles.primaryBtn, { marginTop: 20, height: 58 }, adding && { opacity: 0.6 }]} onPress={handleAddMedicine} disabled={adding}>
                {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Add Medicine</Text>}
              </TouchableOpacity>
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', marginHorizontal: 16, marginTop: 16, marginBottom: 8, borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#222' },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16, height: '100%' },
  listContainer: { padding: 16, paddingBottom: 100 },
  emptyText: { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 16 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  cardLow: { borderColor: 'rgba(248,113,113,0.3)' },
  cardInfo: { flex: 1 },
  medName: { color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  medDesc: { color: '#999', fontSize: 13 },
  stockBadge: { alignSelf: 'flex-start', backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginTop: 6, borderWidth: 1, borderColor: '#333' },
  stockGreen: { color: '#22c55e', fontSize: 13, fontWeight: '700' },
  stockRed: { color: '#f87171', fontSize: 13, fontWeight: '700' },
  restockButton: { width: 48, height: 48, backgroundColor: '#3b82f6', borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },

  // FAB
  fab: { position: 'absolute', bottom: 28, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', shadowColor: '#3b82f6', shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },

  // Modals
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: '#1a1a1a', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#333' },
  addModalBox: { backgroundColor: '#1a1a1a', borderRadius: 24, padding: 24, width: '100%', maxWidth: 440, maxHeight: '90%', borderWidth: 1, borderColor: '#333' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  modalSub: { color: '#999', fontSize: 14, marginBottom: 18 },
  modalInput: { backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#333', borderRadius: 14, paddingHorizontal: 16, height: 56, color: '#fff', fontSize: 17, marginBottom: 20 },

  // Form
  fieldLabel: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  formInput: { backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 14, paddingHorizontal: 16, height: 52, color: '#fff', fontSize: 15, marginBottom: 16 },
  unitPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 14, paddingHorizontal: 16, height: 52, marginBottom: 4 },
  unitDropdown: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 14, marginBottom: 16, overflow: 'hidden' },
  unitOption: { paddingVertical: 12, paddingHorizontal: 16 },
  unitOptionText: { color: '#ccc', fontSize: 15 },

  // Buttons
  rowBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, height: 52, borderRadius: 14, backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  cancelBtnText: { color: '#aaa', fontSize: 16, fontWeight: '600' },
  primaryBtn: { flex: 1, height: 52, borderRadius: 14, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
