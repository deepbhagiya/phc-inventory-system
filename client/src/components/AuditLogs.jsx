import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, User, Calendar, Info } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        axios.get('/api/audit').then(res => setLogs(res.data)).catch(console.error);
    }, []);

    const getActionColor = (action) => {
        const act = action?.toLowerCase() || '';
        if (act.includes('create') || act.includes('add')) return '#10b981';
        if (act.includes('update') || act.includes('edit')) return '#3b82f6';
        if (act.includes('delete') || act.includes('remove')) return '#ef4444';
        return '#f59e0b';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                <FileText size={24} color="#3b82f6" /> System Audit Logs
            </h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '2rem' }}>
                {logs.map(log => {
                    const actionColor = getActionColor(log.action);
                    return (
                        <div key={log.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: `4px solid ${actionColor}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ 
                                    display: 'inline-flex', 
                                    padding: '0.25rem 0.5rem', 
                                    borderRadius: '6px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 'bold', 
                                    textTransform: 'uppercase',
                                    backgroundColor: `${actionColor}20`,
                                    color: actionColor,
                                    letterSpacing: '0.5px'
                                }}>
                                    {log.action}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                    <Calendar size={12} /> {new Date(log.createdAt).toLocaleString()}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                <User size={14} color="var(--text-light)" /> 
                                <span style={{ fontWeight: '500' }}>{log.User?.username || 'System Info / Unknown'}</span>
                            </div>

                            <div style={{ 
                                padding: '0.75rem', 
                                backgroundColor: 'var(--background, #121212)', 
                                borderRadius: '8px', 
                                fontSize: '0.8rem', 
                                color: 'var(--text-light)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.5rem',
                                marginTop: '0.25rem'
                            }}>
                                <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary, #3b82f6)' }} />
                                <div style={{ wordBreak: 'break-word' }}>
                                    {(() => {
                                        try {
                                            const details = JSON.parse(log.details);
                                            return Object.entries(details).map(([k, v]) => (
                                                <div key={k} style={{ marginBottom: '2px' }}>
                                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{k}:</span> {String(v)}
                                                </div>
                                            ));
                                        } catch (e) {
                                            return log.details;
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {logs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
                        <FileText size={48} style={{ margin: '0 auto', opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No audit logs found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
