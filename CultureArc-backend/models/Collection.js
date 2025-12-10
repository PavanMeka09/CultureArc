const mongoose = require('mongoose');

const collectionSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        artifacts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Artifact',
            },
        ],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
