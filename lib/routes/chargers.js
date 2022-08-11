'use strict';

const Joi = require('joi');
const Boom = require('@hapi/boom');
const Avocat = require('@hapipal/avocat');

module.exports = [
    {
        method: 'GET',
        path: '/chargers',
        options: {
            id: 'list-chargers',
            auth: false, //this allowed for unauthenticated requests
            plugins: {
                lalalambda: true
            },
            description: 'Lists all available chargers',
            tags: ['api'],
            handler: async (request, h) => {

                const { Chargers } = request.models();
                const chargerList = await Chargers.query();
                return chargerList;

            }
        }
    },
    {
        method: 'post',
        path: '/chargers',
        options: {
            id: 'create-charger',
            plugins: {
                lalalambda: true,
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            description: 'Create a new charger resource ',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    slug: Joi.string().required(),
                    name: Joi.string().required(),
                    description: Joi.string().required(),
                    location: Joi.string().required(),
                    network_protocol: Joi.string().required()
                })
            },
            handler: async (request) => {

                const { Chargers } = request.models();
                const charger = request.payload;
                const existingCharger = await Chargers.query()
                    .where('slug', charger.slug)
                    .where('name', charger.name);

                if (existingCharger.length > 0) {
                    return Boom.badRequest('Charger already exists');
                }

                try {
                    return await Chargers.query().insertAndFetch(charger);
                }
                catch (err) {

                    //Useful when SQL errors not showing up, having difficulty exposing them via command line
                    //request.server.log(err);
                    //return Boom.boomify(err, { statusCode: 400 });

                    Avocat.rethrow(err); // Throws a 409 if DB conflict from Objection 👍
                    throw err;
                }
            }
        }
    },
    {
        method: 'post',
        path: '/charger/{slug}',
        options: {
            id: 'edit-charger',
            plugins: {
                lalalambda: true
            },
            tags: ['api'],

            description: 'Update an existing charger resource',
            validate: {

                payload: Joi.object({
                    //slug: Joi.string().required(),
                    name: Joi.string(),
                    description: Joi.string(),
                    location: Joi.string(),
                    status: Joi.string().valid('Idle', 'Active', 'Inactive', 'Out of Order'),
                    network_protocol: Joi.string().valid('OCPP 1.5', 'OCPP 1.6', 'OCPP 2.0'),
                    public: Joi.boolean()
                })
            },
            handler: async (request) => {

                const { Chargers } = request.models();
                const charger = request.payload;

                const existingCharger = await Chargers.query().findOne({ slug: `${request.params.slug}` });

                if (!existingCharger) {
                    return Boom.badRequest(`${request.params.slug} is not a valid charger`);
                }

                //TODO: Try/catch
                const updatedCharger = await existingCharger.$query().patchAndFetch({ ...charger });

                return updatedCharger;

            }
        }
    },
    {
        method: 'post',
        path: '/chargers/delete/{slug}',
        options: {
            id: 'delete-charger',
            plugins: {
                lalalambda: true
            },
            description: 'Remove a charger from the API',
            handler: async (request) => {

                const { Chargers } = request.models();
                const existingCharger = await Chargers.query().findOne({ slug: `${request.params.slug}` });

                if (!existingCharger) {
                    return Boom.badRequest(`${request.params.slug} is not a valid charger`);
                }

                //TODO: Soft delete record
                try {

                    const affectedRows = await Chargers.query().deleteById(existingCharger.id);

                    if (affectedRows !== 1) {

                        return Boom.badRequest('Something went wrong removing the charger resource');
                    }

                }
                catch (err) {

                    return Boom.badRequest(err);

                }

                existingCharger.deleted = true;
                return existingCharger;
                //return await Chargers.query().insertAndFetch(charger);
            }
        }
    },
    {
        method: 'get',
        path: '/bad',
        options: {
            description: 'A failure endpoint to generate 500 errors',
            handler: (request) => {

                //bad code, always 500s
                throw new Error();
            }
        }
    }
];
