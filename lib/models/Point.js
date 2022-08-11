'use strict';

const Schwifty = require('@hapipal/schwifty');
const Joi = require('joi');

module.exports = class Points extends Schwifty.Model {
    static tableName = 'Points';

    static joiSchema = Joi.object({
        id: Joi.number().integer(),
        lat: Joi.string(),
        lon: Joi.string(),
    });

};
