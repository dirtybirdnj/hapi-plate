'use strict';

exports.up = async (knex) => {

    await knex.schema.createTable('Points', (table) => {

        table.increments('id').primary();
        table.string('lat').notNullable();
        table.string('lon').notNullable();

    });

};

exports.down = async (knex) => {

    await knex.schema.dropTable('Points');
};