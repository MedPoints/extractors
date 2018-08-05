const fs = require('fs');
const path = require('path');
const sax = require('sax');

const parser = sax.createStream(false, {normalize: true, position: false});

class Price {
	constructor({dollars, mpts}) {
		this.dollars = dollars || 50;
		this.mpts = mpts || 5;
	}
}

class DrugGroup {
	constructor({name}) {
		this.name = name;
		this.drugs = [];
	}
}

class DrugModel {
	constructor({name, short_descr, full_descr, group, price, is_covered_by_insurance, is_by_prescription}) {
		this.name = name;
		this.short_descr = short_descr;
		this.full_descr = full_descr;
		this.price = new Price(price || {});
		this.is_covered_by_insurance = true;//is_covered_by_insurance;
		this.is_by_prescription = true;//is_by_prescription;
	}
}

const groups = [];

let currentDrug;
let currentGroup;

parser.on('opentag', ({name, attributes}) => {
	switch(name){
		case 'CATEGORY':
			currentGroup = new DrugGroup({name: attributes['NAME']});
			break;
		case 'DRUGS':
			const {NAME, INDICATION} = attributes;
			currentDrug = new DrugModel({
				name: NAME,
				short_descr: INDICATION
			});
			break;
		case 'ITEM':
			if(attributes['NAME'] === 'Description'){
				currentDrug.full_descr = attributes['VALUE'];
			}
			break;
		default:
			break;
	}
});

parser.on('closetag', (name) => {
	switch(name){
		case 'DRUGS':
			currentGroup.drugs.push(currentDrug);
			break;
		case 'CATEGORY':
			groups.push(currentGroup);
			break;
		default:
			break;
	}
});

parser.on('error', function (err){
	console.log(err);
	this._parser.error = null;
	this._parser.resume();
});

parser.on('end', () => {
	const output = fs.createWriteStream(path.join(__dirname, 'drugs.json'));
	output.write(JSON.stringify({result: groups}, null, 4));
	output.end();
});

const filepath = path.join(__dirname, 'parse.xml');
const filestream = fs.createReadStream(filepath);

filestream.pipe(parser);
