const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Will add the Currency type to the Mongoose Schema types
require('mongoose-currency').loadType(mongoose);

const Currency = mongoose.Types.Currency;

const promotionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        required: true,
		min: 0
    },
    featured: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

var Promotions = mongoose.model('Promotion', promotionSchema);

module.exports = Promotions;
