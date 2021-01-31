const goodCampground = JSON.parse(campground);
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: goodCampground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());


new mapboxgl.Marker()
    .setLngLat(goodCampground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h4>${goodCampground.title}</h4> <p>${goodCampground.location}</p>`
            )
    )
    .addTo(map)