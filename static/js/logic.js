// Select which data to use: all day / all week / all month

// let URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'; // all day
let URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'; // all week
// let URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'; // all month

// Load in geoJSON data
d3.json(URL).then(function (response) {
    // console.log(response)
    // Call function within the d3 wrapper
    createFeatures(response.features)
})

// Create Features function to initiate Popups and Markers
function createFeatures(earthquakeData) {
    // Popup with Location, Depth and Magnitude
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.title}</h3>\
            <hr>Magnitude: ${feature.properties.mag}<hr>\
            Depth: ${feature.geometry.coordinates[2]}`)
    }

    // Get min and max Depth values for plotting circles

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
        // Plot the markers using Popup function onEachFeature above
        onEachFeature: onEachFeature,
        // Use pointToLayer to return circles
        pointToLayer: function (feature, latlng) {
            // console.log(feature.properties.mag)
            // Size of circles determined by magntiude
            magScale = (feature.properties.mag) * 2;
            // Color of circles determined by depth
            depthScale = feature.geometry.coordinates[2];

            // return L.circleMarker(latlng, geojsonMarkerOptions);
            // Call the getColor function to get a color based on the depthScale
            let markerColor = getColor(depthScale);
            // console.log(markerColor)
            // Input arguments for the circleMarker
            return L.circleMarker(latlng, {
                                        radius: magScale,
                                        color: markerColor,
                                        fillColor: markerColor,
                                        fillOpacity: 0.75
                                    });

        }
    });
    // call createMap function
    createMap(earthquakes);
}


// Define color ranges based on depth
function getColor(depth) {            
    // https://www.rapidtables.com/web/color/RGB_Color.html
    let markerColor = '#8B0000'//DARK RED - default color: if depth 100 or greater
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

// Define createMap function
function createMap(earthquakes) {
    // tileLayer, baseMap and overlayMaps
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
    // Map is centred on Globe. Use center_USA coordinates if want it centred on USA (and change zoom to level 5)
    let myMap = L.map("map", {
        center: center_globe,
        zoom: 3,
        layers: [street, earthquakes]
    });
    // set control layer for Maps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Define legend
    let legend = L.control({ position: 'bottomright' });
    // Colors:
    let legend_info = {
        'Less than 0': '#008000',//GREEN
        '0-19' : '#00FF00',//LIME
        '20-39' : '#FFFF00',//YELLOW
        '40-59' : '#FFA500',//ORANGE
        '60-79' : '#FF4500',//ORANGE RED
        '80-99' : '#FF0000',// RED
        '100 +' : '#8B0000'//DARK RED
    };
    
    // console.log(legend_info)
    // console.log(Object.keys(legend_info)[0])
    
    // Add legend    
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "legend");
        
        div.innerHTML = [
            "<h3>Earthquake Depth (m)</h3><hr>",
            '<i style="background:' + Object.values(legend_info)[0] + '"></i><b>' + Object.keys(legend_info)[0] + '</b><br>',
            '<i style="background:' + Object.values(legend_info)[1] + '"></i><b>' + Object.keys(legend_info)[1] + '</b><br>',
            '<i style="background:' + Object.values(legend_info)[2] + '"></i><b>' + Object.keys(legend_info)[2] + '</b><br>',
            '<i style="background:' + Object.values(legend_info)[3] + '"></i><b>' + Object.keys(legend_info)[3] + '</b><br>',
            '<i style="background:' + Object.values(legend_info)[4] + '"></i><b>' + Object.keys(legend_info)[4] + '</b><br>',
            '<i style="background:' + Object.values(legend_info)[5] + '"></i><b>' + Object.keys(legend_info)[5] + '</b><br>',
            '<i style="background:' + Object.values(legend_info)[6] + '"></i><b>' + Object.keys(legend_info)[6] + '</b>'
          ].join(""); 
        
        return div;
      };
      

    legend.addTo(myMap);
}