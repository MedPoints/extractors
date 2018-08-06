const fs = require('fs');
const axios = require('axios');

(async () => {
    try {
        var counter = 0;
        const hospitals = JSON.parse(fs.readFileSync('parsed-hospitals.json', 'utf8'));

        var specs = hospitals.map(x => x.specializations);
        console.log(specs);
        var uniqueSpec = new Set(specs);

        for(let spec of uniqueSpec){
            await axios.post('/api/specializations', { name : spec});
            counter++;
            console.log(counter);
        }

        let savedSpecs = await axios.get(`/api/specializations?count=${uniqueSpec.size}`);
        for(let hospital of hospitals){
            let hospitalSpecs = hospital.specializations.split(',').map(x => x.trim());
            let mappedSpecs = [];
            for(let hospitalSpec of hospitalSpecs){
                let savedSpec = savedSpecs.data.result.data.filter(x => x.name == hospitalSpec)[0];
                mappedSpecs.push(savedSpec);
            }
            hospital.specializations = mappedSpecs;

            await axios.post('/api/hospitals', hospital);
            counter++;
            console.log(counter);
        }


    } catch (e) {
        console.log(e);
    }
})();
