import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Plus, Trash2, CheckCircle, UserPlus, ClipboardList, FileSpreadsheet, Package } from 'lucide-react';
import { downloadExcel } from '../utils/excelExport';

const PatientIssue = () => {
    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    
    // Detailed Patient Info State
    const [patientInfo, setPatientInfo] = useState({
        patientName: '',
        patientAge: '',
        patientGender: 'Male',
        patientContact: '',
        doctorName: ''
    });

    const [successMsg, setSuccessMsg] = useState('');
    const [activeTab, setActiveTab] = useState('medicines'); // 'medicines' or 'cart'

    useEffect(() => {
        axios.get('/api/inventory').then(res => setMedicines(res.data)).catch(console.error);
    }, []);

    const addToCart = (med) => {
        const existing = cart.find(item => item.id === med.id);
        if (existing) {
             if (existing.issueQty + 1 > med.quantity) return alert('Insufficient stock!');
             setCart(cart.map(item => item.id === med.id ? { ...item, issueQty: item.issueQty + 1 } : item));
        } else {
            if (med.quantity < 1) return alert('Out of stock!');
            setCart([...cart, { ...med, issueQty: 1 }]);
        }
        setSuccessMsg(`Added ${med.name} to cart`);
        setTimeout(() => setSuccessMsg(''), 2000);
    };

    const updateQty = (id, qty) => {
        const med = medicines.find(m => m.id === id);
        if (qty > med.quantity) return alert('Insufficient stock!');
        if (qty < 1) return;
        setCart(cart.map(item => item.id === id ? { ...item, issueQty: qty } : item));
    };

    const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

    const handleIssue = async () => {
        if (!patientInfo.patientName || !patientInfo.patientAge || !patientInfo.doctorName) {
            return alert('Please fill in Name, Age, and Doctor Name!');
        }
        if (cart.length === 0) return alert('Cart is empty!');

        try {
            const payload = {
                ...patientInfo,
                items: cart.map(item => ({ medicineId: item.id, quantity: item.issueQty }))
            };
            const res = await axios.post('/api/inventory/dispense', payload);
            setSuccessMsg(`Issued Successfully! Ref: ${res.data.referenceId}`);
            
            setCart([]);
            setPatientInfo({ patientName: '', patientAge: '', patientGender: 'Male', patientContact: '', doctorName: '' });
            
            axios.get('/api/inventory').then(res => setMedicines(res.data));
            setTimeout(() => setSuccessMsg(''), 5000);
            setActiveTab('medicines');
        } catch (err) {
            alert(err.response?.data?.msg || 'Issue failed');
        }
    };

    const downloadLog = async () => {
        try {
            const res = await axios.get('/api/inventory/transactions');
            const issues = res.data.filter(t => t.type === 'OUT');
            const data = issues.map(t => ({
                Date: new Date(t.transactionDate).toLocaleString(),
                Patient: t.patientName,
                Age: t.patientAge,
                Gender: t.patientGender,
                Contact: t.patientContact,
                Doctor: t.doctorName,
                Medicine: t.Medicine?.name,
                Quantity: t.quantity,
                RefID: t.referenceId
            }));
            downloadExcel(data, 'Patient_Issue_Log');
        } catch (err) {
            console.error(err);
            alert('Failed to download log');
        }
    };

    const filteredMeds = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    const totalCartItems = cart.reduce((acc, item) => acc + item.issueQty, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {/* Header & Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        <ShoppingBag size={24} color="#3b82f6" /> Issue Medicine
                    </h1>
                    <button 
                        onClick={downloadLog} 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--surface, #1e1e1e)', color: 'var(--primary, #3b82f6)', border: '1px solid var(--primary, #3b82f6)', borderRadius: '8px', fontSize: '0.875rem' }}
                    >
                        <FileSpreadsheet size={16} /> Export
                    </button>
                </div>

                {successMsg && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <CheckCircle size={18} /> {successMsg}
                    </div>
                )}

                {/* Mobile Tabs */}
                <div style={{ display: 'flex', backgroundColor: 'var(--surface, #1e1e1e)', borderRadius: '12px', padding: '0.25rem' }}>
                    <button 
                        onClick={() => setActiveTab('medicines')}
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'medicines' ? 'var(--primary, #3b82f6)' : 'transparent', color: activeTab === 'medicines' ? '#fff' : 'var(--text-light, #888)', fontWeight: activeTab === 'medicines' ? 'bold' : 'normal', transition: 'all 0.2s' }}
                    >
                        Search Medicines
                    </button>
                    <button 
                        onClick={() => setActiveTab('cart')}
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'cart' ? 'var(--primary, #3b82f6)' : 'transparent', color: activeTab === 'cart' ? '#fff' : 'var(--text-light, #888)', fontWeight: activeTab === 'cart' ? 'bold' : 'normal', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        Review Cart
                        {totalCartItems > 0 && (
                            <span style={{ backgroundColor: activeTab === 'cart' ? '#fff' : '#3b82f6', color: activeTab === 'cart' ? '#3b82f6' : '#fff', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                {totalCartItems}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Tab Content: Medicines */}
            {activeTab === 'medicines' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input 
                        style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--surface, #1e1e1e)', fontSize: '1rem', width: '100%' }}
                        placeholder="Search Medicine..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '2rem' }}>
                        {filteredMeds.map(med => (
                            <div key={med.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>{med.name}</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-light)' }}>{med.description}</p>
                                    <div style={{ marginTop: '0.5rem', display: 'inline-block', padding: '0.2rem 0.5rem', backgroundColor: med.quantity > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: med.quantity > 0 ? '#22c55e' : '#ef4444', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                        Stock: {med.quantity}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => addToCart(med)}
                                    disabled={med.quantity <= 0}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.25rem', 
                                        padding: '0.5rem 1rem', 
                                        backgroundColor: med.quantity > 0 ? '#3b82f6' : 'var(--border)', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: '8px',
                                        opacity: med.quantity <= 0 ? 0.5 : 1
                                    }}
                                >
                                    <Plus size={18} /> Add
                                </button>
                            </div>
                        ))}
                        {filteredMeds.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                                <Package size={32} style={{ margin: '0 auto', opacity: 0.5, marginBottom: '0.5rem' }} />
                                No medicines found.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab Content: Cart & Checkout */}
            {activeTab === 'cart' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
                    
                    {/* Cart Items */}
                    <div className="card" style={{ padding: '1rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShoppingBag size={18} /> Selected Items ({cart.length})
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {cart.length === 0 ? (
                                <p style={{ color: 'var(--text-light)', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>Cart is empty. Go back and select medicines.</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--background, #121212)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Stock: {item.quantity}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <input 
                                                type="number" 
                                                style={{ width: '60px', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center', backgroundColor: 'var(--surface)' }}
                                                value={item.issueQty}
                                                onChange={e => updateQty(item.id, parseInt(e.target.value))}
                                            />
                                            <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', background: 'transparent', border: 'none', padding: '0.25rem' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Patient Form */}
                    <div className="card" style={{ padding: '1rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ClipboardList size={18} /> Patient Details
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-light)' }}>Patient Name *</label>
                                <input 
                                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }} 
                                    placeholder="Full Name" 
                                    value={patientInfo.patientName} 
                                    onChange={e => setPatientInfo({...patientInfo, patientName: e.target.value})} 
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-light)' }}>Age *</label>
                                    <input 
                                        type="number" 
                                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }} 
                                        placeholder="Age" 
                                        value={patientInfo.patientAge} 
                                        onChange={e => setPatientInfo({...patientInfo, patientAge: e.target.value})} 
                                    />
                                </div>
                                <div className="input-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-light)' }}>Gender *</label>
                                    <select 
                                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }} 
                                        value={patientInfo.patientGender} 
                                        onChange={e => setPatientInfo({...patientInfo, patientGender: e.target.value})}
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-light)' }}>Contact No (Optional)</label>
                                <input 
                                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }} 
                                    placeholder="Phone Number" 
                                    value={patientInfo.patientContact} 
                                    onChange={e => setPatientInfo({...patientInfo, patientContact: e.target.value})} 
                                />
                            </div>

                            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-light)' }}>Prescribing Doctor *</label>
                                <input 
                                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }} 
                                    placeholder="Dr. Name" 
                                    value={patientInfo.doctorName} 
                                    onChange={e => setPatientInfo({...patientInfo, doctorName: e.target.value})} 
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleIssue}
                        disabled={cart.length === 0}
                        style={{ 
                            width: '100%', 
                            padding: '1rem', 
                            backgroundColor: cart.length > 0 ? '#10b981' : 'var(--border)', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '12px', 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: cart.length > 0 ? 1 : 0.5,
                            marginTop: '0.5rem',
                            boxShadow: cart.length > 0 ? '0 4px 6px rgba(16, 185, 129, 0.2)' : 'none'
                        }}
                    >
                        <CheckCircle size={20} /> Complete Issue
                    </button>
                </div>
            )}
        </div>
    );
};

export default PatientIssue;
