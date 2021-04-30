// Require modules
const mongoose = require('mongoose');
const { Schema } = mongoose;

const Repository = new Schema({
	identifier: { type: String, index: true },
    name: { type: String, index: true },
	description: String,
	owner: {
		login: String,
		url: String
	},
    url: String,
	openGraphImageUrl: String,
    license: {
        name: { type: String, index: true },
        url: String
    },
    primaryLanguage: {
        color: String,
        name: { type: String, index: true }
    },
    flags: {
        isArchived: Boolean,
        isFork: Boolean,
        isMirror: Boolean,
        isPrivate: Boolean,
        isTemplate: Boolean
    }
});

module.exports = Repository;
