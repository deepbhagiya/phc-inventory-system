import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Search, Filter, AlertTriangle, Package } from 'lucide-react';

const Inventory = () => {
    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newMed, setNewMed] = useState({
        name: '', description: '', quantity: 0, unit: 'tablets', expiryDate: '', minStockLevel: 10
    });

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const res = await axios.get('/api/inventory');
            setMedicines(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/inventory', newMed);
            setShowModal(false);
            setNewMed({ name: '', description: '', quantity: 0, unit: 'tablets', expiryDate: '', minStockLevel: 10 });
            fetchMedicines();
        } catch (err) {
            console.error(err);
            alert('Error adding medicine');
        }
    };

    const handleDelete = async (id) => {
        if(!confirm('Are you sure?')) return;
        try {
            await axios.delete(`/api/inventory/${id}`);
            fetchMedicines();
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light, #888)' }} />
                    <input 
                        type="text" 
                        placeholder="Search medicines..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.8rem', width: '100%', padding: '0.8rem 2.8rem', borderRadius: '12px', border: '1px solid var(--border, #333)', backgroundColor: 'var(--surface, #1e1e1e)', fontSize: '1rem' }}
                    />
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.5rem', 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.8rem', 
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        width: '100%',
                        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.25)'
                    }}
                >
                    <Plus size={20} /> Add New Medicine
                </button>
            </div>

            {/* Mobile List View */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filtered.map(med => {
                    const isLowStock = med.quantity <= med.minStockLevel;
                    return (
                        <div key={med.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
                            {isLowStock && (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#ef4444' }} />
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ padding: '0.5rem', backgroundColor: isLowStock ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: isLowStock ? '#ef4444' : '#3b82f6' }}>
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{med.name}</h3>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light, #aaa)' }}>{med.description || 'No description'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(med.id)} 
                                    style={{ padding: '0.5rem', color: '#ef4444', background: 'transparent', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--background, #121212)', borderRadius: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light, #888)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: isLowStock ? '#ef4444' : 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {med.quantity} {med.unit}
                                        {isLowStock && <AlertTriangle size={14} color="#ef4444" />}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light, #888)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expires</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{med.expiryDate || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light, #888)' }}>
                        <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
                        <p>No medicines found.</p>
                    </div>
                )}
            </div>

            {/* Mobile-friendly Bottom Sheet Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ 
                        width: '100%', 
                        maxHeight: '90vh', 
                        overflowY: 'auto', 
                        borderBottomLeftRadius: 0, 
                        borderBottomRightRadius: 0,
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px',
                        padding: '1.5rem',
                        animation: 'slideUp 0.3s ease-out'
                    }}>
                        <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--border, #444)', borderRadius: '2px', margin: '0 auto 1.5rem auto' }} />
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Add New Medicine</h2>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Name</label>
                                <input required value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            </div>
                            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Description</label>
                                <input value={newMed.description} onChange={e => setNewMed({...newMed, description: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Quantity</label>
                                    <input type="number" required value={newMed.quantity} onChange={e => setNewMed({...newMed, quantity: parseInt(e.target.value)})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
                                </div>
                                <div className="input-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Unit</label>
                                    <select value={newMed.unit} onChange={e => setNewMed({...newMed, unit: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', backgroundColor: 'var(--surface)' }}>
                                        <option value="tablets">Tablets</option>
                                        <option value="capsules">Capsules</option>
                                        <option value="bottles">Bottles</option>
                                        <option value="injections">Injections</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Expiry</label>
                                    <input type="date" required value={newMed.expiryDate} onChange={e => setNewMed({...newMed, expiryDate: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
                                </div>
                                <div className="input-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Min Stock</label>
                                    <input type="number" required value={newMed.minStockLevel} onChange={e => setNewMed({...newMed, minStockLevel: parseInt(e.target.value)})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                                <button type="button" style={{ flex: 1, padding: '0.8rem', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '12px', color: 'inherit' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '0.8rem', backgroundColor: '#3b82f6', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
