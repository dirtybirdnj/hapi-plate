'use strict';

const Schwifty = require('@hapipal/schwifty');
const Joi = require('joi');

module.exports = class Plates extends Schwifty.Model {
    static tableName = 'Plates';

    static joiSchema = Joi.object({
        id: Joi.number().integer(),
        name: Joi.string(),
        description: Joi.string(),
        public: Joi.boolean().default(false)
    });

};
