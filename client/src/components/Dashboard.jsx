import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Package, Activity } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalMedicines: 0, lowStock: 0, stockValue: 0 });
    const [alerts, setAlerts] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [medsRes, alertsRes] = await Promise.all([
                axios.get('/api/inventory'),
                axios.get('/api/inventory/alerts')
            ]);
            
            const meds = medsRes.data;
            setStats({
                totalMedicines: meds.length,
                lowStock: alertsRes.data.length,
                totalStock: meds.reduce((acc, curr) => acc + curr.quantity, 0)
            });
            setAlerts(alertsRes.data);
            
            // Prepare chart data (Top 5 medicines by stock)
            const data = meds
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5)
                .map(m => ({ name: m.name, quantity: m.quantity }));
            setChartData(data);

        } catch (err) {
            console.error("Error fetching dashboard data", err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            {/* Stats Overview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', borderRadius: '50%', color: '#0284c7' }}>
                        <Package size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Total Medicines</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalMedicines}</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '50%', color: '#b91c1c' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Low Stock Alerts</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.lowStock}</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', borderRadius: '50%', color: '#15803d' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Total Stock Units</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalStock}</div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Low Stock Alerts</h3>
                    {alerts.length === 0 ? (
                        <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No alerts at the moment.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {alerts.map(item => (
                                <div key={item.id} style={{ padding: '0.75rem', border: '1px solid #fee2e2', backgroundColor: 'var(--bg-card, #fff5f5)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '500', color: '#ef4444' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light, #7f1d1d)' }}>Qty: {item.quantity} (Min: {item.minStockLevel})</div>
                                    </div>
                                    <AlertTriangle size={16} color="#ef4444" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Top Stock Overview</h3>
                    <div style={{ height: '250px', minWidth: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: 'var(--text-main, #888)'}} interval={0} angle={-45} textAnchor="end" height={60} />
                                <YAxis tick={{fontSize: 12, fill: 'var(--text-main, #888)'}} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface, #333)', borderColor: 'var(--border, #555)' }} />
                                <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
