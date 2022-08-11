'use strict';


const Joi = require('joi');
const Boom = require('@hapi/boom');
const Avocat = require('@hapipal/avocat');
const CSV = require('csv-string');


module.exports = [
    {
        method: 'GET',
        path: '/points',
        options: {
            id: 'list-points',
            auth: false, //this allowed for unauthenticated requests
            description: 'Lists all geo points',
            tags: ['api'],
            handler: async (request, h) => {

                const { Points } = request.models();

                if (request.query.bbox) {

                    const bounds = request.query.bbox.split(',');
                    try {

                        const pointList = await Points.query()
                            .where('lon','BETWEEN',[bounds[2], bounds[0]])
                            .andWhere('lat','BETWEEN',[bounds[1], bounds[3]]);


                        const features = pointList.map((point) => {

                            return {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [point.lon, point.lat]
                                }
                            };
                        });

                        const formattedResponse = {
                            type: 'FeatureCollection',
                            features
                        };

                        return h.response(formattedResponse);


                    }
                    catch (err) {
                        console.log(err);
                    }

                }
                else {

                    return await Points.query();
                }

            }
        }
    },
    {
        method: 'POST',
        path: '/points/upload',

        options: {
            id: 'upload-points',
            payload: {
                multipart: true,
                maxBytes: 1000 * 1000 * 5 // 5 Mb
            },
            description: 'Create new points from csv ',

            tags: ['api'],
            handler: async (request) => {

                const { Points } = request.models();
                const csvData = CSV.parse(request.payload);

                //remove header row
                const rawData = csvData.shift();

                try {

                    const newPoints = await csvData.map(async (point) => {

                        const pointObj = {
                            lat: point[5],
                            lon: point[6]
                        };

                        console.log(pointObj);

                        const newPoint = await Points.query().insertAndFetch(pointObj);

                        return newPoint;
                    });

                    return newPoints;

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
        method: 'GET',
        path: '/points/map',
        options: {
            id: 'point-map',
            auth: false, //this allowed for unauthenticated requests
            description: 'Display an HTML Map',

            handler: (request) => {

                return `

                <html>
                <head>
                  <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
                    integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
                    crossorigin=""
                  />
                  <script
                    src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
                    integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
                    crossorigin=""
                  ></script>
                </head>
                <body>
                  <div id="mapid" style="width: 600px; height: 500px; border: 1px solid #ccc"></div>
                  <script>
                    // https://leafletjs.com/examples/quick-start/example.html
                    "use strict";

                    var yourDataUrl = "http://localhost:3000/points";
                    // throw-away token
                    var accessToken =
                      "pk.eyJ1IjoidGhlcm9udG9vbWV5IiwiYSI6ImNqenZ6bGtydjAwMHkzbXBvbjB3OXIxYTMifQ.P3icvgrMaQgB9PMkg7pB5A";

                    var myMap = L.map("mapid").setView([42.8606637, -72.6015389], 12);
                    L.tileLayer(
                      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" +
                        accessToken,
                      {
                        maxZoom: 18,
                        id: "mapbox/streets-v11",
                      }
                    ).addTo(myMap);

                    const loadDataForBounds = function () {
                      var bounds = myMap.getBounds();
                      fetch(yourDataUrl + "?bbox=" + bounds.toBBoxString())
                        .then(function (response) {
                          return response.json();
                        })
                        .then(function (myJson) {
                          L.geoJSON(myJson).addTo(myMap);
                        });
                    };

                    myMap.on("moveend", function (e) {
                      loadDataForBounds();
                    });
                    loadDataForBounds();
                  </script>
                </body>
              </html>


                `;

            }
        }
    }
];
