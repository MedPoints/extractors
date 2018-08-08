const fs = require('fs');
const axios = require('axios');

const pharmacies = JSON.parse(fs.readFileSync('pharmacy.json', 'utf8')).result;
(async () => {
    try {
        for(let pharmacy of pharmacies){
            await axios.post(`http://:8080/api/pharmacies`, pharmacy);
        }

    } catch (e) {
        console.log(e);
    }
})();
