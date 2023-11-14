// all day: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
// all week: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson

// let URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
let URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

d3.json(URL).then(function (response) {
    console.log(response)
    createFeatures(response.features)
})

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.title}</h3>\
            <hr>Magnitude: ${feature.properties.mag}<hr>\
            Depth: ${feature.geometry.coordinates[2]}`)
    }

    // let geojsonMarkerOptions;

    // var geojsonMarkerOptions = {
    //     radius: 5,
    //     radius: feature.properties.mag,
    //     fillColor: "#ff7800",
    //     color: "#000",
    //     weight: 1,
    //     opacity: 1,
    //     fillOpacity: 0.8
    // };

    let minDepth = 0;
    let maxDepth = 0;
    for (i=0; i < earthquakeData.length; i++) {
        depth = earthquakeData[i].geometry.coordinates[2];
        if (depth < minDepth) {
            minDepth = depth;
        } else if (depth > maxDepth) {
            maxDepth = depth;
        }
    }
    console.log('Min Depth is: ',minDepth,'Max Depth is: ', maxDepth)


    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            // console.log(feature.properties.mag)
            magScale = (feature.properties.mag) * 3;
            depthScale = feature.geometry.coordinates[2];

            // return L.circleMarker(latlng, geojsonMarkerOptions);
            let markerColor = getColor(depthScale);
            // console.log(markerColor)
            return L.circleMarker(latlng, {
                                        radius: magScale,
                                        color: markerColor,
                                        fillColor: markerColor,
                                        fillOpacity: 0.75
                                    });

        }
    });

    createMap(earthquakes);
}

function getColor(depth) {            
    // https://www.rapidtables.com/web/color/RGB_Color.html
    let markerColor = '#8B0000'//DARK RED
    if (depth < 0) {
        markerColor = '#008000';//GREEN
    } else if (depth < 20) {
        markerColor = '#00FF00';//LIME
    } else if (depth < 40) {
        markerColor = '#FFFF00';//YELLOW
    } else if (depth < 60) {
        markerColor = '#FFA500';//ORANGE
    } else if (depth < 80) {
        markerColor = '#FF4500';//ORANGE RED
    } else if (depth < 100) {
        markerColor = '#FF0000';// RED
    }
    return markerColor;
}

function createMap(earthquakes) {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let baseMaps = {
        'Street Map': street
    }

    let overlayMaps = {
        Earthquakes: earthquakes
    }

    let center_USA = [
        37.09, -95.71
    ]

    let center_globe = [
        30, 31
    ]
    let myMap = L.map("map", {
        center: center_globe,
        zoom: 3,
        layers: [street, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}