const express = require('express');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const textGeneration = async (prompt) => {

    try {
        const response = await openai.createCompletion({
            
            model: 'text-davinci-003',
            prompt: `Pretend you are Andy, a customer service employee at PIAA Cyprus.
            PIAA Cyprus offers two options for aftermarket car bulbs, our LED "Ultra" option and our Halogen "Hyper Arros" option. This is the PIAA Cyprus website: https://piaacyprus.com/
            User: Hello
            Andy: Hello, how can I help you today?
            User: I want to buy new bulbs for my car.
            Andy: Fantastic, what kind of car do you have?
            User: ${prompt}?
            Andy:`,
            temperature: 0.3,
            max_tokens: 2000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6,
            stop: ['Human:', 'AI:'],
        });
        
        console.log('API Response:', response); // Add this line

    
        return {
            status: 1,
            response: `${response.data.choices[0].text}`
        };
    } catch (error) {
        return {
            status: 0,
            response: ''
        };
    }
};


const webApp = express();

const PORT = process.env.PORT || 8080;
//const PORT = process.env.PORT;

webApp.use(express.urlencoded({ extended: true }));
webApp.use(express.json());
webApp.use((req, res, next) => {
    console.log(`Path ${req.path} with Method ${req.method}`);
    next();
});


webApp.get('/', (req, res) => {
    res.sendStatus(200);
});


    const webhook = async (req, res) => {
      let action = req.body.queryResult.action;
      let queryText = req.body.queryResult.queryText;
  
      if (action === 'input.unknown') {
        let result = await textGeneration(queryText);
        if (result.status == 1) {
          res.send({
            fulfillmentText: result.response,
          });
        } else {
          res.send({
            fulfillmentText: `Sorry, I'm not able to help with that.`,
          });
        }
      } else {
        res.send({
          fulfillmentText: `No handler for the action ${action}.`,
        });
      }
    };
  
    webApp.post('/webhook', webhook);
  
    // Export the webhook function
    exports.webhook = webhook;
