const Promise = require('bluebird');
const request = require('request-promise');
const fs = require('fs');
const path = require('path');
const parse = require('csv-parse');

class LocationModel {
	constructor({address, city, state, country, postCode}) {
		this.address = address;
		this.city = city;
		this.state = state;
		this.country = country;
		this.postCode = postCode;
	}

	toString(){
		return [this.country, this.city, this.address];
	}
}

class Pharmacy {
	constructor({name, network, coordinations, location, workTime, work_time, photos, drugs, short_descr, site}){
		this.name = name;
		this.network = network;
		this.coordinations = coordinations || {};
		this.location = new LocationModel(location);
		this.work_time = workTime || work_time;
		this.photos = photos || [];
		this.drugs = drugs || [];
		this.short_descr = short_descr || "";
		this.site = site || '';
	}
}

const filename = 'pharmacies.csv';
const filepath = path.join(__dirname, filename);

const parser = parse({delimiter: ';', trim: true}, async (err, data) => {
	if(err){
		console.log(err);
		return;
	}
	data.shift();
	const result = await Promise.map(data, async (line) => {
		const address = line[6];
		let locationInfo = await request.post('http://www.mapquestapi.com/geocoding/v1/address?key=HCtpChAtMfE0Ek8CKPqhJQSBPL6ytYdV', {
			body: {
				location: address
			},
			json: true
		});
		locationInfo = locationInfo.results[0].locations[0];
		let location;
		let coordinations;
		if(locationInfo){
			location = new LocationModel({
				address: address,
				city: locationInfo.adminArea5,
				state: locationInfo.adminArea3,
				country: locationInfo.adminArea1,
				postCode: locationInfo.postalCode
			});
			coordinations = {lat: locationInfo.latLng.lat, lon: locationInfo.latLng.lng};
		}else{
			location = new LocationModel({
				address: address,
				city: line[5],
				country: line[4]
			});
		}
		const workTime = getWorktime(line[7]);
		return new Pharmacy({
			name: line[1],
			network: line[2],
			photos: [line[3]],
			work_time: workTime,
			short_descr: line[8],
			location: location,
			coordinations: coordinations,
			site: line[9]
		});
	});
	fs.writeFileSync('pharmacy.json', JSON.stringify({result: result}, null, 4));
});

function getWorktime(workTime){
	const splitedWorkTime = workTime.split('\n').filter(wt => !!wt);
	const worktime = [];
	for(let i = 0; i < splitedWorkTime.length; i +=2){
		let line = `${splitedWorkTime[i]}`;
		if(splitedWorkTime[i + 1] !== undefined){
			line += ` ${splitedWorkTime[i + 1]}`;
		}
		worktime.push(line);
	}
	return worktime;
}

fs.createReadStream(filepath).pipe(parser);
