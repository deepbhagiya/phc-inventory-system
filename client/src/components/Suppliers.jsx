import { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Plus, Trash2, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [newSup, setNewSup] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        axios.get('/api/suppliers').then(res => setSuppliers(res.data)).catch(err => console.error(err));
    }, []);

    const addSupplier = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await axios.post('/api/suppliers', newSup);
            setSuppliers([...suppliers, res.data]);
            setNewSup({ name: '', contactPerson: '', email: '', phone: '', address: '' });
            setShowForm(false);
        } catch (err) {
            alert('Error adding supplier');
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteSupplier = async (id) => {
        if(!confirm('Delete supplier?')) return;
        try {
            await axios.delete(`/api/suppliers/${id}`);
            setSuppliers(suppliers.filter(s => s.id !== id));
        } catch(err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Truck size={24} color="#3b82f6" /> Suppliers
                </h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        backgroundColor: showForm ? 'transparent' : '#3b82f6', 
                        color: showForm ? 'var(--text-main)' : 'white', 
                        border: showForm ? '1px solid var(--border)' : 'none', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                    }}
                >
                    {showForm ? 'Cancel' : <><Plus size={16} /> Add New</>}
                </button>
            </div>
            
            {showForm && (
                <div className="card" style={{ padding: '1rem', marginBottom: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Add New Supplier</h3>
                    <form onSubmit={addSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Name *</label>
                            <input 
                                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', width: '100%' }} 
                                placeholder="Company Name" required value={newSup.name} onChange={e => setNewSup({...newSup, name: e.target.value})} 
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Person</label>
                                <input style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', width: '100%' }} placeholder="Contact Person" value={newSup.contactPerson} onChange={e => setNewSup({...newSup, contactPerson: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</label>
                                <input style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', width: '100%' }} placeholder="Phone" value={newSup.phone} onChange={e => setNewSup({...newSup, phone: e.target.value})} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                            <input type="email" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', width: '100%' }} placeholder="Email" value={newSup.email} onChange={e => setNewSup({...newSup, email: e.target.value})} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</label>
                            <input style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', width: '100%' }} placeholder="Address" value={newSup.address} onChange={e => setNewSup({...newSup, address: e.target.value})} />
                        </div>
                        <button type="submit" disabled={isSubmitting} style={{ 
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '0.5rem' 
                        }}>
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Save Supplier
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
                {suppliers.map(s => (
                    <div key={s.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{s.name}</h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                    Contact: <span style={{ color: 'var(--text-main)' }}>{s.contactPerson || 'N/A'}</span>
                                </div>
                            </div>
                            <button onClick={() => deleteSupplier(s.id)} style={{ color: '#ef4444', background: 'transparent', border: 'none', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                                <Phone size={14} /> <span>{s.phone || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                                <Mail size={14} /> <span>{s.email || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                                <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> <span style={{ lineHeight: '1.2' }}>{s.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {suppliers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
                        <Truck size={48} style={{ margin: '0 auto', opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No suppliers added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Suppliers;
