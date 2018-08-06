const fs = require('fs');
const axios = require('axios');

const drugs = JSON.parse(fs.readFileSync('drugs.json', 'utf8'));
(async () => {
    try {
        await axios.post('/api/maintenance/importDrugs', drugs);
    } catch (e) {
        console.log(e);
    }
})();
