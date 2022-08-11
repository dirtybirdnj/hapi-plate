# hapi-plate 🍽🚧 

### Overview:

This repo is the "open book" resource / notes for a screenshare that should:

- [x] 1. Provide a running web framework for coding (hapi + sqlite + objection)
- [x] 2. Publish data via JSON
- [ ] 3. Import data from CSV

### Getting it working locally

`git clone git@github.com:dirtybirdnj/hapi-plate.git`

`npm install`

`npm run dev`

`touch server/.env` <- .env goes here not in project root

ENV Variables Required:
```
PORT=3000
NODE_ENV=development <- this uses knex / mysql and creds below
#NODE_ENV=local <- this uses a local SQLite .db file
API_KEY=ACA8675309DAD
```

### Making Model / Migration changes

`npx knex migrate:latest`

`npx knex migrate:rollback`

`npm run db-wipe` (runs the two commands above in correct sequence)

TODO: SEEDING

## Extending the API beyond chargers

`npx hpal make model Boiler`

`npx hpal make route boiler`

`npx knex migrate:make add-boiler`

## Making Authenticated Requests:

The format for simple header based API Key authentication can be seen in the **Authorization** header below

```
axios({
	"method": "POST",
	"url": "http://localhost:3000/create",
	"headers": {
		"Authorization": "Bearer ACA8675309DAD",
		"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
	},
	"data": "name=Fancy+Plate+585&description=The+fanciest+plate+you%27ve+ever+seen"
})
```