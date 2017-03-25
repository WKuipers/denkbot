const fs = require('fs');
const async = require('async');
var triggers = {};
const read_triggerfile = (filename, callback) => {
  fs.readFile('triggers/' + filename, 'utf8', (err, data) => {
    if (err){
      callback(filename + 'could not be read');
    }
    else {
      triggers[filename.slice(0, -5)] = JSON.parse(data);
      callback();
    }
  });
};

fs.readdir('triggers', (err, files) => {
  if (!err) {
    async.each(files, read_triggerfile, (err) => {
      if(err) {
        console.error(err);
      }
    });
  }
});

exports.messageHandler = message => {
  if (message.author === message.client.user || !message.guild || !message.guild.available){
    return;
  }
  const content = message.content;
  const guildid = message.guild.id;
  if (!triggers[guildid]) {
    triggers[guildid] = {}
  }
  if (content.startsWith('!add')) {
    return add(message);
  }
  const triggersFound = Object.keys(triggers[guildid]).filter(trigger => {
    return content.toLowerCase().includes(trigger)
  })
  if (triggersFound.length > 0){
    message.channel.sendMessage(
      triggersFound.reduce( (resp, key) => {
        return resp + triggers[guildid][key] + '\n';
      }, ''))
      .catch(
      );
  }
};

function add(message) {
    const content = message.content;
    const triggerResp = content.substr(5).split(';', 2);
    const guildid = message.guild.id;
    if(triggerResp.length != 2){
      return message.reply('wrong syntax for !add.\nuse !add trigger;response');
    }
    triggers[guildid][triggerResp[0].toLowerCase()] = triggerResp[1];
    return message.reply('added a reponse for ' + triggerResp[0] + '.')
      .then( () => {
        fs.writeFile('triggers/' + guildid + '.json',
          JSON.stringify(triggers[guildid]), err => console.error
        );
      });
}
