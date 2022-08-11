'use strict';

exports.up = async (knex) => {

    await knex.schema.createTable('Chargers', (table) => {

        table.increments('id').primary();
        table.string('slug').notNullable().unique();
        table.string('name').notNullable().unique();
        table.string('description').notNullable();
        table.string('location').notNullable();
        table.string('status').notNullable();
        table.string('network_protocol').notNullable();
        table.boolean('public').notNullable();
    });
};

exports.down = async (knex) => {

    await knex.schema.dropTable('Chargers');
};
