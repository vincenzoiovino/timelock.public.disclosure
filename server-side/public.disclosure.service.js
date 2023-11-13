const express = require('express');
const app = express();
const nocache = require('nocache');
const cors = require('cors');
app.use(nocache());
app.use(cors());


// start the express web server listening on 8082
app.listen(81, () => {
    console.log('listening on 8082');
});
console.log('timelock.public.disclosure server-side code running');
app.get('/public.disclosure/*', async (req, res) => {

    res.send(req.params).status(200);

});