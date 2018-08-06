const fs = require('fs');
const axios = require('axios');

const services = JSON.parse(fs.readFileSync('services.json', 'utf8')).result;
(async () => {
    try {
        for(let service of services){
            if(service.name === 'First examination'){
                let hospitalsCount = await axios.get(`/api/hospitals/count`);
                let hospitals = await axios.get(`/api/hospitals?count=${hospitalsCount.data.result}`);

                let hospitalsProviders = hospitals.data.result.data.map(hospital => {
                    var hospital = {
                        id: hospital.id,
                        name: hospital.name,
                        coordinations : hospital.coordinations
                    };
                    return hospital;
                });

                service.providers = {
                    hospitals : hospitalsProviders
                }
            }

            await axios.post(`/api/services`, service);
        }



    } catch (e) {
        console.log(e);
    }
})();
