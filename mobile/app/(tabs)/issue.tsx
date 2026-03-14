import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import api from '../../utils/axiosConfig';
import { Plus, Minus, Trash2, Search, PackageOpen, ClipboardList, CheckCircle } from 'lucide-react-native';

export default function IssueScreen() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  
  const [patientInfo, setPatientInfo] = useState({
    patientName: '',
    patientAge: '',
    patientGender: 'Male',
    patientContact: '',
    doctorName: ''
  });

  const [activeTab, setActiveTab] = useState('medicines'); // 'medicines' or 'cart'

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/api/inventory');
      setMedicines(res.data);
    } catch (err) {
      console.log('Fetch error', err);
    }
  };

  const addToCart = (med: any) => {
    const existing = cart.find(item => item.id === med.id);
    if (existing) {
      if (existing.issueQty + 1 > med.quantity) return Alert.alert('Insufficient stock!');
      setCart(cart.map(item => item.id === med.id ? { ...item, issueQty: item.issueQty + 1 } : item));
    } else {
      if (med.quantity < 1) return Alert.alert('Out of stock!');
      setCart([...cart, { ...med, issueQty: 1 }]);
    }
  };

  const updateQty = (id: number, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const newQty = item.issueQty + delta;
    if (newQty < 1) {
      removeFromCart(id);
      return;
    }
    
    const med: any = medicines.find((m: any) => m.id === id);
    if (newQty > med?.quantity) {
      Alert.alert('Insufficient stock!');
      return;
    }

    setCart(cart.map(i => i.id === id ? { ...i, issueQty: newQty } : i));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const [issuing, setIssuing] = useState(false);

  const handleIssue = async () => {
    if (cart.length === 0) {
      return Alert.alert('Empty Cart', 'Add at least one medicine to the cart.');
    }
    if (!patientInfo.patientName.trim()) {
      return Alert.alert('Validation Error', 'Patient Name is required.');
    }
    if (!patientInfo.patientAge.trim()) {
      return Alert.alert('Validation Error', 'Patient Age is required.');
    }
    if (!patientInfo.doctorName.trim()) {
      return Alert.alert('Validation Error', 'Doctor Name is required.');
    }

    setIssuing(true);
    try {
      const payload = {
        ...patientInfo,
        patientAge: parseInt(patientInfo.patientAge, 10), // must be a number
        items: cart.map(item => ({ medicineId: item.id, quantity: item.issueQty }))
      };

      console.log('Dispatching payload:', JSON.stringify(payload));
      const res = await api.post('/api/inventory/dispense', payload);
      Alert.alert('✅ Success', `Issued Successfully!\nRef: ${res.data.referenceId}`);

      setCart([]);
      setPatientInfo({ patientName: '', patientAge: '', patientGender: 'Male', patientContact: '', doctorName: '' });
      fetchMedicines();
      setActiveTab('medicines');
    } catch (err: any) {
      console.error('Issue error:', err.response?.status, err.response?.data);
      Alert.alert(
        'Issue Failed',
        err.response?.data?.msg || err.response?.data?.message || err.message || 'An error occurred.'
      );
    } finally {
      setIssuing(false);
    }
  };

  const filteredMeds = medicines.filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()));

  const renderMedicineItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.medName}>{item.name}</Text>
        <Text style={styles.medDesc}>{item.description}</Text>
        <View style={styles.stockBadge}>
          <Text style={item.quantity > 0 ? styles.stockGreen : styles.stockRed}>
            Stock: {item.quantity}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.addButton, item.quantity <= 0 && styles.disabledButton]} 
        onPress={() => addToCart(item)}
        disabled={item.quantity <= 0}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabHeader}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'medicines' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('medicines')}
        >
          <Search size={18} color={activeTab === 'medicines' ? '#fff' : '#888'} />
          <Text style={[styles.tabText, activeTab === 'medicines' && styles.activeTabText]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'cart' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('cart')}
        >
          <PackageOpen size={18} color={activeTab === 'cart' ? '#fff' : '#888'} />
          <Text style={[styles.tabText, activeTab === 'cart' && styles.activeTabText]}>
            Cart ({cart.reduce((a, b) => a + b.issueQty, 0)})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'medicines' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.searchContainer}>
            <Search color="#888" size={20} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search Medicine..." 
              placeholderTextColor="#666"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <FlatList 
            data={filteredMeds}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={renderMedicineItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />

        </View>
      ) : (
        <ScrollView 
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <PackageOpen size={48} color="#333" />
              <Text style={styles.emptyCartText}>Your cart is empty.</Text>
            </View>
          ) : (
            <View>
              {cart.map(item => (
                <View key={item.id} style={styles.cartItemCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.medName}>{item.name}</Text>
                    <Text style={styles.medDesc}>Stock remaining: {item.quantity}</Text>
                  </View>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}>
                      <Minus color="#fff" size={18} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.issueQty}</Text>
                    <TouchableOpacity onPress={() => updateQty(item.id, 1)} style={styles.qtyBtn}>
                      <Plus color="#fff" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.trashBtn}>
                      <Trash2 color="#ef4444" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={styles.patientForm}>
                <View style={styles.formHeader}>
                  <ClipboardList color="#3b82f6" size={20} />
                  <Text style={styles.formTitle}>Patient Details</Text>
                </View>
                
                <TextInput style={styles.input} placeholderTextColor="#666" placeholder="Patient Name *" value={patientInfo.patientName} onChangeText={t => setPatientInfo({...patientInfo, patientName: t})} />
                
                <View style={styles.rowGroup}>
                  <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholderTextColor="#666" placeholder="Age *" keyboardType="numeric" value={patientInfo.patientAge} onChangeText={t => setPatientInfo({...patientInfo, patientAge: t})} />
                  <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} placeholderTextColor="#666" placeholder="Gender" value={patientInfo.patientGender} onChangeText={t => setPatientInfo({...patientInfo, patientGender: t})} />
                </View>
                
                <TextInput style={styles.input} placeholderTextColor="#666" placeholder="Contact No" value={patientInfo.patientContact} onChangeText={t => setPatientInfo({...patientInfo, patientContact: t})} />
                <TextInput style={styles.input} placeholderTextColor="#666" placeholder="Doctor Name *" value={patientInfo.doctorName} onChangeText={t => setPatientInfo({...patientInfo, doctorName: t})} />

                <TouchableOpacity
                  style={[styles.issueButton, issuing && { opacity: 0.6 }]}
                  onPress={handleIssue}
                  activeOpacity={0.8}
                  disabled={issuing}
                >
                  <CheckCircle color="#fff" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.issueButtonText}>{issuing ? 'Issuing...' : 'Complete Issue'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', paddingHorizontal: 16, paddingTop: 16 },
  tabHeader: { flexDirection: 'row', backgroundColor: '#141414', borderRadius: 16, padding: 6, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 12, flexDirection: 'row', gap: 8 },
  activeTabBtn: { backgroundColor: '#222' },
  tabText: { color: '#888', fontWeight: 'bold', fontSize: 16 },
  activeTabText: { color: '#fff' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 16, borderWidth: 1, borderColor: '#333', marginBottom: 16, paddingHorizontal: 16, height: 56 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16, height: '100%' },
  
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  cardInfo: { flex: 1 },
  medName: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  medDesc: { color: '#888', fontSize: 13, marginBottom: 10 },
  stockBadge: { alignSelf: 'flex-start', backgroundColor: '#1a1a1a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stockGreen: { color: '#22c55e', fontSize: 12, fontWeight: '700' },
  stockRed: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  addButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 8 },
  disabledButton: { backgroundColor: '#333', shadowOpacity: 0 },
  
  emptyCart: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyCartText: { color: '#666', fontSize: 18, marginTop: 16, fontWeight: '500' },
  
  cartItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 4 },
  qtyBtn: { padding: 8, backgroundColor: '#2a2a2a', borderRadius: 8 },
  qtyText: { color: '#fff', fontSize: 18, fontWeight: '700', marginHorizontal: 12, minWidth: 20, textAlign: 'center' },
  trashBtn: { padding: 8, marginLeft: 8 },
  
  patientForm: { backgroundColor: '#141414', padding: 24, borderRadius: 24, marginTop: 16, marginBottom: 32, borderWidth: 1, borderColor: '#222' },
  formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  formTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  input: { backgroundColor: '#1a1a1a', color: '#fff', paddingHorizontal: 16, height: 54, borderRadius: 14, borderWidth: 1, borderColor: '#333', marginBottom: 16, fontSize: 15 },
  rowGroup: { flexDirection: 'row', justifyContent: 'space-between' },
  issueButton: { flexDirection: 'row', backgroundColor: '#10b981', height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 10 },
  issueButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});
