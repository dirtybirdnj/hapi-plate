'use strict';


const Joi = require('joi');
const Boom = require('@hapi/boom');
const Avocat = require('@hapipal/avocat');


module.exports = [
    {
        method: 'GET',
        path: '/plates',
        options: {
            id: 'list-plates',
            auth: false, //this allowed for unauthenticated requests
            description: 'Lists all plates',
            tags: ['api'],
            handler: async (request) => {

                const { Plates } = request.models();
                const plateList = await Plates.query();
                return plateList;

            }
        }
    },
    {
        method: 'POST',
        path: '/plates',
        options: {
            id: 'create-plate',
            description: 'Create a new plate ',
            validate: {
                payload: Joi.object({
                    name: Joi.string().required(),
                    description: Joi.string().required()
                })
            },
            tags: ['api'],
            handler: async (request) => {

                console.log(request.    payload);

                const { Plates } = request.models();
                const plate = request.payload;
                const existingPlate = await Plates.query()
                    .where('name', plate.name);

                if (existingPlate.length > 0) {
                    return Boom.badRequest('Charger already exists');
                }

                try {
                    return await Plates.query().insertAndFetch(plate);
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
        method: 'POST',
        path: '/plates/upload',

        options: {
            id: 'upload-plates',
            payload: {
                multipart: true
            },
            description: 'Create new plates from csv ',

            tags: ['api'],
            handler: async (request) => {

                // console.log(request.payload);

                // const { Plates } = request.models();
                // const plate = request.payload;
                // const existingPlate = await Plates.query()
                //     .where('name', plate.name);

                // if (existingPlate.length > 0) {
                //     return Boom.badRequest('Charger already exists');
                // }

                console.log(request.payload);

                return [1,2,3];

                try {
                    return await Plates.query().insertAndFetch(plate);
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
];
