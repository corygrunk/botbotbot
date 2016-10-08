  const express = require('express')
  const Slapp = require('slapp')
  const BeepBoopConvoStore = require('slapp-convo-beepboop')
  const BeepBoopContext = require('slapp-context-beepboop')
  if (!process.env.PORT) throw Error('PORT missing but required')

  var slapp = Slapp({
    convo_store: BeepBoopConvoStore(),
    context: BeepBoopContext()
  })

  var app = slapp.attachToExpress(express())

  slapp.message('joke', ['direct_message'], (msg, text, match2) => {
    msg.say(joke)
    getJoke()
  })

  slapp.message('ready (.*)', ['direct_message'], (msg, text, match1) => {
    msg.say({
      text: 'Greetings brave adventurer, is your group ready?',
      attachments: [
        {
          text: '',
          callback_id: 'are_you_ready',
          actions: [
            {
              name: 'answer',
              text: 'Yes, we are ready',
              type: 'button',
              value: 'yes',
              style: 'default'
            },
            {
              name: 'answer',
              text: 'No, more will join',
              type: 'button',
              value: 'no',
              style: 'default'
            }
          ]
        }
      ]
    }).route('ready', { what: match1 })
  })

  var joke = {};

  var request = require('request');
  var getJoke = function() {
      request('http://api.icndb.com/jokes/random', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        joke = JSON.parse(body).value.joke
      }
    })
  }

  getJoke()

  slapp.route('ready', (msg, value, state) => {
    if (msg.type !== 'action') {
      msg.say('You must choose a button! Choose wisely.').route('handleHi', state)
      return
    }
    // SPECIFYING THE ARRAY INDEX SEEMS WRONG
    if (msg.body.actions[0].value === 'yes') {
      msg.say('Let\'s begin...')
    } else {
      msg.say('I will wait while you gather your group.')
    }
  })

  app.get('/', function (req, res) {
    res.send('Hello.')
  })

  console.log('Listening on : ' + process.env.PORT)
  app.listen(process.env.PORT)
