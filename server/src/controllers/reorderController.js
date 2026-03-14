const Reorder = require('../models/Reorder');
const Medicine = require('../models/Medicine');
const Supplier = require('../models/Supplier');

exports.getAll = async (req, res) => {
    try {
        const reorders = await Reorder.findAll({
            include: [Medicine, Supplier]
        });
        res.json(reorders);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await Reorder.update({ status }, { where: { id } });
        res.json({ msg: 'Status updated' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
