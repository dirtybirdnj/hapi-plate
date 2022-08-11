'use strict';

const Schwifty = require('@hapipal/schwifty');
const Joi = require('joi');

module.exports = class Chargers extends Schwifty.Model {
    static tableName = 'Chargers';

    static joiSchema = Joi.object({
        id: Joi.number().integer(),
        slug: Joi.string(),
        name: Joi.string(),
        description: Joi.string(),
        location: Joi.string(),
        status: Joi.string().allow('Idle', 'Active', 'Inactive', 'Out of Order').default('Inactive'),
        network_protocol: Joi.string().allow('OCPP 1.5', 'OCPP 1.6', 'OCPP 2.0'),
        public: Joi.boolean().default(false)
    });

};
