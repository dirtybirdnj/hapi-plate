'use strict';


const Joi = require('joi');
const Boom = require('@hapi/boom');
const Avocat = require('@hapipal/avocat');
const CSV = require('csv-string');


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

                const { Plates } = request.models();
                let csvData = CSV.parse(request.payload);
                
                //remove header row
                const rawData = csvData.shift();

                //gather names for duplicate check
                //ORM will do this for us, but I find when processing CSV data (see below)
                //this pattern provides a better way to indicate what line # or data is offending
                //instead of just saying "csv is bad, please re-upload"
                
                const plateNames = csvData.map( plate => {
                    //Row 0 name, row 1 description
                    return plate[0];
                });

                
                const existingPlates = await Plates.query().where('name','in', plateNames);

                if (existingPlates.length > 0) {

                    const existingPlateNames = existingPlates.map(plate => {
                        console.log(plate)
                        return plate.name;
                    });

                    return Boom.badRequest(`Plate name already exists: ${ existingPlateNames.join(', ')}`);
                }                

                //Now that all the records are confirmed unique, we can create everything

                try {

                    const newPlates = csvData.map(async plate => {

                        let plateObj = {
                            name: plate[0],
                            description:  plate[1]
                        }
                        const newPlate = await Plates.query().insertAndFetch(plateObj);
                        return newPlate;
                    });
  
                    return newPlates;
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
