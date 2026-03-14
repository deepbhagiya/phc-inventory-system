import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, CheckCircle, Clock, Truck, Download, AlertCircle } from 'lucide-react';
import { downloadExcel } from '../utils/excelExport';

const Reorders = () => {
    const [reorders, setReorders] = useState([]);

    useEffect(() => {
        fetchReorders();
    }, []);

    const fetchReorders = async () => {
        try {
            const res = await axios.get('/api/reorders');
            setReorders(res.data);
        } catch (err) { console.error(err); }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/api/reorders/${id}`, { status });
            fetchReorders();
        } catch (err) { console.error(err); }
    };

    const exportData = () => {
        const data = reorders.map(r => ({
            ID: r.id,
            Medicine: r.Medicine?.name,
            Supplier: r.Supplier?.name,
            Quantity: r.quantity,
            Status: r.status,
            Date: r.orderDate
        }));
        downloadExcel(data, 'Reorder_Report');
    };

    const getStatusInfo = (status) => {
        switch(status) {
            case 'Pending': return { color: '#ef4444', icon: <AlertCircle size={16} /> };
            case 'Ordered': return { color: '#f59e0b', icon: <Clock size={16} /> };
            case 'Received': return { color: '#10b981', icon: <CheckCircle size={16} /> };
            default: return { color: '#888', icon: <AlertCircle size={16} /> };
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        <ShoppingCart size={24} color="#3b82f6" /> Reorders
                    </h1>
                    <button 
                        onClick={exportData} 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--surface, #1e1e1e)', color: 'var(--primary, #3b82f6)', border: '1px solid var(--primary, #3b82f6)', borderRadius: '8px', fontSize: '0.875rem' }}
                    >
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Reorder List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
                {reorders.map(r => {
                    const statusInfo = getStatusInfo(r.status);
                    return (
                        <div key={r.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: `4px solid ${statusInfo.color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{r.Medicine?.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                        <Truck size={14} /> {r.Supplier?.name || 'No configured supplier'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{r.quantity} units</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{new Date(r.orderDate).toLocaleDateString()}</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.35rem', 
                                    padding: '0.3rem 0.75rem', 
                                    borderRadius: '16px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 'bold',
                                    backgroundColor: `${statusInfo.color}20`, // 20 hex opacity
                                    color: statusInfo.color
                                }}>
                                    {statusInfo.icon} {r.status}
                                </div>
                                
                                <div>
                                    {r.status === 'Pending' && (
                                        <button 
                                            onClick={() => updateStatus(r.id, 'Ordered')} 
                                            style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}
                                        >
                                            Mark Ordered
                                        </button>
                                    )}
                                    {r.status === 'Ordered' && (
                                        <button 
                                            onClick={() => updateStatus(r.id, 'Received')} 
                                            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}
                                        >
                                            Mark Received
                                        </button>
                                    )}
                                    {r.status === 'Received' && (
                                        <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <CheckCircle size={14} /> Done
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {reorders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
                        <ShoppingCart size={48} style={{ margin: '0 auto', opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No active reorders.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reorders;
