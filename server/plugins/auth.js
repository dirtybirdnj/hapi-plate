'use strict';


module.exports = {
    name: 'auth',
    async register(server) {

        await server.register([
            {
                plugin: require('hapi-auth-bearer-token'),
                options: {
                }
            }
        ]);

        server.auth.strategy('simple', 'bearer-access-token', {
            validate: (request, token, h) => {

                // Validate your token here
                //TODO: Read from DB table to find valid API keys

                const isValid = token === process.env.API_KEY;
                const credentials = { token };
                const artifacts = { test: 'info' };

                return { isValid, credentials, artifacts };
            }
        });

        server.auth.default('simple'); //applies auth to all routes
    }
};
