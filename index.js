const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());
const isMACAddress = (str) => {
    const regex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i;
    return regex.test(str);
};
const transformMac = (mac,platform) => {
    if(platform === 'linux'){
        return mac.replace(/-/g,':');
    }
    return mac;
}
app.get('/bluetooth/:id/:command/:debug?', (req, res) => {
    let { id, command: option, debug } = req.params;
    const commands = ['connect','disconnect']
    id = transformMac(id,process.platform);
    if(!commands.includes(option)) throw new Error(`Invalid option ${option}`);
    if (!isMACAddress(id)) throw new Error(`Invalid MAC address ${id}`);
 
    const { exec } = require('child_process');
    let command;
    if(process.platform === 'linux') {
        command = `bluetoothctl ${option} ${id}`;
    } else {
        command = `blueutil --${option} ${id} --info ${id}`;
    }
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send(debug==='debug'?error:'failed');
            return;
        }
        console.log(`stdout: ${stdout}`);
        res.status(200).send(debug==='debug'?stdout :`device ${option}ed to mac`);
    })
    });
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(err.message);
});
app.listen(3210,'0.0.0.0', () => console.log('App listening on port 3210'));