'use strict';

const Dotenv = require('dotenv');
const Confidence = require('@hapipal/confidence');
const Toys = require('@hapipal/toys');
const Schwifty = require('@hapipal/schwifty');

// Pull .env into process.env
Dotenv.config({ path: `${__dirname}/.env` });

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
    server: {
        host: 'localhost',
        port: {
            $param: 'PORT',
            $coerce: 'number',
            $default: 3000
        },
        debug: {
            $filter: 'NODE_ENV',
            development: {
                log: ['error', 'implementation', 'internal'],
                request: ['error', 'implementation', 'internal']
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: './plugins/auth', //auth strategy
                options: {}
            },
            {
                plugin: '../lib', // Main plugin
                options: {}
            },
            {
                plugin: '@hapipal/schwifty',
                options: {
                    $filter: 'NODE_ENV',
                    $default: {},
                    $base: {
                        migrateOnStart: true,
                        knex: {
                            client: 'sqlite3',
                            useNullAsDefault: true,     // Suggested for sqlite3
                            connection: {
                                filename: 'hapi-plate.db'
                            },
                            migrations: {
                                stub: Schwifty.migrationsStubPath
                            }
                        }
                    },
                    local: {
                        migrateOnStart: true,
                        knex: {
                            client: 'sqlite3',
                            useNullAsDefault: true,     // Suggested for sqlite3
                            connection: {
                                filename: 'hapi-batt.db'
                            },
                            migrations: {
                                stub: Schwifty.migrationsStubPath
                            }
                        }
                    },
                    development: {
                        migrateOnStart: false,
                        knex: {
                            client: 'mysql',
                            connection: {
                                host: process.env.AWS_RDS_ENDPOINT,
                                port: 3306,
                                user: process.env.AWS_RDS_USERNAME,
                                password: process.env.AWS_RDS_PASSWORD,
                                database: process.env.AWS_RDS_DATABASE
                            },
                            migrations: {
                                stub: Schwifty.migrationsStubPath
                            }
                        }
                    },
                    production: {
                        migrateOnStart: false
                    }
                }
            },
            {
                plugin: {
                    $filter: 'NODE_ENV',
                    $default: '@hapipal/hpal-debug',
                    production: Toys.noop
                }
            },
            {
                plugin: 'blipp',
                options: {}
            }
        ]
    }
});
