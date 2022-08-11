'use strict';

exports.up = async (knex) => {

    await knex.schema.createTable('Plates', (table) => {

        table.increments('id').primary();

        table.string('name').notNullable().unique();
        table.string('description').notNullable();
        table.boolean('public').notNullable();
    });

};

exports.down = async (knex) => {

    await knex.schema.dropTable('Plates');
};
