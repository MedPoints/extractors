const fs = require('fs');
const path = require('path');
const readline = require('readline');

class Service {
	constructor({name, short_descr, full_descr, is_covered_by_insurance, price, time, providers}){
		this.name = name;
		this.short_descr = short_descr;
		this.full_descr = full_descr;
		this.is_covered_by_insurance = true;//is_covered_by_insurance;
		this.price = new Price(price || {});
		this.time = time;
		this.providers = providers || {};
	}
}

class Price {
	constructor({dollars, mpts}) {
		this.dollars = dollars || 0;
		this.mpts = mpts || 0;
	}
}

const file = path.join(__dirname, 'services.txt');

const servicesInterface = readline.createInterface({
	input: fs.createReadStream(file),
	crlfDelay: Infinity
});

const output = fs.createWriteStream(path.join(__dirname, 'services.json'));

let start = true;
const result = [];

servicesInterface.on('line', (line) => {
	if(!line){
		return;
	}
	const service = new Service({name: line.trim()});
	result.push(service);
});
servicesInterface.on('close', () => {
	output.write(JSON.stringify({result: result}, null, 4));
	output.end();
});
