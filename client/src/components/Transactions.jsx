import { useState, useEffect } from 'react';
import axios from 'axios';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await axios.get('/api/inventory/transactions');
                setTransactions(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTransactions();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <h1 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={24} color="#3b82f6" /> Transaction History
            </h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '2rem' }}>
                {transactions.map(tx => {
                    const isIn = tx.type === 'IN';
                    return (
                        <div key={tx.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: isIn ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {isIn ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                        {tx.Medicine?.name || 'Deleted Medicine'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light, #888)', marginTop: '0.25rem' }}>
                                        {new Date(tx.transactionDate).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ 
                                    padding: '0.25rem 0.5rem', 
                                    borderRadius: '8px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 'bold',
                                    backgroundColor: isIn ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: isIn ? '#22c55e' : '#ef4444'
                                }}>
                                    {isIn ? '+' : '-'}{tx.quantity} units
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                                    <span style={{ color: 'var(--text-light, #888)', fontSize: '0.75rem' }}>Reason:</span> {tx.reason}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light, #888)' }}>
                                    User: {tx.User?.username || 'Unknown'}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {transactions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                        <History size={32} style={{ margin: '0 auto', opacity: 0.5, marginBottom: '0.5rem' }} />
                        No transactions found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
