class HospitalInfo{
    constructor(name, specializations, network, address, working_hours, phones, email, site, departments, images){
        this.name = name;
        this.network = network;
        this.specializations = specializations;
        this.address = address;
        this.work_time = working_hours;
        this.phone = phones;
        this.email = email;
        this.site = site;
        this.departments = departments;
        this.photos = images;
    }
}

class LocationModel {
    constructor(address, city, state, country, postCode) {
        this.address = address;
        this.city = city;
        this.state = state;
        this.country = country;
        this.postCode = postCode;
    }
}

var fs = require('fs');
var parse = require('csv-parse');
const axios = require('axios');

var inputFile='hospitals.csv';
console.log("Processing hospitals file");

var res = [];
var parser = parse({delimiter: ';'}, async function (err, data) {
    data.shift();

    for(let line of data) {
        let info = new HospitalInfo(
            line[1].trim(),
            line[2].trim(),
            line[3].trim(),
            line[4].trim(),
            line[5].trim(),
            line[6].trim(),
            line[7].trim(),
            line[8].trim(),
            line[9].split(',').map(x => x.trim()),
            line[10].trim()
        );

        let locationInfo = await axios.post('http://www.mapquestapi.com/geocoding/v1/address?key=', {
            location: info.address
        });
        locationInfo = locationInfo.data.results[0].locations[0];
        if(locationInfo){
            info.location = new LocationModel(info.address, locationInfo.adminArea5, locationInfo.adminArea3, locationInfo.adminArea1, locationInfo.postalCode);
            info.coordinations = {lat: locationInfo.latLng.lat, lon: locationInfo.latLng.lng};
        }else{
            var ii = 0;
        }

        res.push(info);
    }

    fs.writeFile(
        './parsed-hospitals.json',
        JSON.stringify(res),
        function (err) {
            if (err) {
                console.error('Crap happens');
            }
        }
    );

});

fs.createReadStream(inputFile).pipe(parser);


