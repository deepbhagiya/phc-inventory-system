import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Plus, Trash2, CheckCircle, Printer } from 'lucide-react';

const Dispense = () => {
    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [patientName, setPatientName] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        axios.get('/api/inventory').then(res => setMedicines(res.data)).catch(console.error);
    }, []);

    const addToCart = (med) => {
        const existing = cart.find(item => item.id === med.id);
        if (existing) {
             if (existing.saleQty + 1 > med.quantity) return alert('Insufficient stock!');
             setCart(cart.map(item => item.id === med.id ? { ...item, saleQty: item.saleQty + 1 } : item));
        } else {
            if (med.quantity < 1) return alert('Out of stock!');
            setCart([...cart, { ...med, saleQty: 1 }]);
        }
    };

    const updateQty = (id, qty) => {
        const med = medicines.find(m => m.id === id);
        if (qty > med.quantity) return alert('Insufficient stock!');
        if (qty < 1) return;
        setCart(cart.map(item => item.id === id ? { ...item, saleQty: qty } : item));
    };

    const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

    const handleDispense = async () => {
        if (!patientName) return alert('Patient Name is required!');
        if (cart.length === 0) return alert('Cart is empty!');

        try {
            const payload = {
                patientName,
                items: cart.map(item => ({ medicineId: item.id, quantity: item.saleQty }))
            };
            const res = await axios.post('/api/inventory/dispense', payload);
            setSuccessMsg(`Dispensed Successfully! Ref: ${res.data.referenceId}`);
            setCart([]);
            setPatientName('');
            // Refresh stock
            axios.get('/api/inventory').then(res => setMedicines(res.data));
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            alert(err.response?.data?.msg || 'Dispense failed');
        }
    };

    const filteredMeds = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            
            {/* Left: Medicine Search */}
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold mb-6">Discovery / Search</h1>
                <input 
                    className="w-full p-3 border rounded mb-4" 
                    placeholder="Search Medicine..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMeds.map(med => (
                        <div key={med.id} className="card p-4 border hover:shadow-md transition">
                            <h3 className="font-bold text-lg">{med.name}</h3>
                            <p className="text-gray-500 text-sm mb-2">{med.description}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className={`badge ${med.quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                                    Stock: {med.quantity}
                                </span>
                                <button 
                                    onClick={() => addToCart(med)}
                                    disabled={med.quantity <= 0}
                                    className="btn btn-primary text-sm flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Cart / Dispense */}
            <div className="card h-fit sticky top-4">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
                    <ShoppingBag /> Dispense
                </h2>
                
                {successMsg && (
                    <div className="bg-green-100 border border-green-500 text-green-700 p-3 rounded mb-4 flex items-center gap-2">
                        <CheckCircle size={18} /> {successMsg}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Patient Name / ID</label>
                    <input 
                        className="w-full p-2 border rounded" 
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                        placeholder="John Doe"
                    />
                </div>

                <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                    {cart.length === 0 ? (
                        <p className="text-gray-400 text-center italic">No items added</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-gray-500">Stock: {item.quantity}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        className="w-16 p-1 border rounded text-center"
                                        value={item.saleQty}
                                        onChange={e => updateQty(item.id, parseInt(e.target.value))}
                                    />
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button 
                    onClick={handleDispense}
                    disabled={cart.length === 0}
                    className="w-full btn btn-primary py-3 font-bold text-lg disabled:opacity-50"
                >
                    Complete Dispense
                </button>
            </div>
        </div>
    );
};

export default Dispense;
