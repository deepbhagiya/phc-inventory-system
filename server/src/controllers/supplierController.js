const Supplier = require('../models/Supplier');

exports.getAll = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll();
        res.json(suppliers);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.create = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.json(supplier);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.delete = async (req, res) => {
    try {
        await Supplier.destroy({ where: { id: req.params.id } });
        res.json({ msg: 'Deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
