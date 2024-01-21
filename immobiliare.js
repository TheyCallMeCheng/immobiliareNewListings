import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const apiUrl = 'https://www.immobiliare.it/api-next/search-list/real-estates';
const queryParams = {
    fkRegione: "lom",
    idProvincia: "MI",
    idComune: 8042,
    idNazione: "IT",
    idContratto: 2,
    idCategoria: 4,
    pag: 1,
    paramsCount: 1,
    path: "/affitto-stanze/milano/"
};

const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const lowPriceIndex = 100;

function sendTelegramMessage(newListings) {
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const message = newListings.map(item => {
        if (parseFloat(item.realEstate.price.value) > lowPriceIndex) {
            return `
${item.realEstate.title}
🚀  Link: ${item.seo.url}
💸  Price: ${item.realEstate.price.formattedValue}
📍   Position: ${item.realEstate.properties[0].location.macrozone}
🗺️  G Maps: https://maps.google.com/?q=${item.realEstate.properties[0].location.latitude},${item.realEstate.properties[0].location.longitude}
🌆  Floor: ${item.realEstate.properties[0].floor.value}
🚾  Bathrooms ${item.realEstate.properties[0].bathrooms}
            `;
        } else {
            return `
📌💥📢📌💥📢📌💥📢📌💥📢
Prezzo "Basso" (<${lowPriceIndex})
${item.realEstate.title}
🚀  Link: ${item.seo.url}
💸  Price: ${item.realEstate.price.formattedValue}
📍   Position: ${item.realEstate.properties[0].location.macrozone}
🗺️  G Maps: https://maps.google.com/?q=${item.realEstate.properties[0].location.latitude},${item.realEstate.properties[0].location.longitude}
🌆  Floor: ${item.realEstate.properties[0].floor.value}
🚾  Bathrooms ${item.realEstate.properties[0].bathrooms}
📌💥📢📌💥📢📌💥📢📌💥📢
            `;
        }
    }).join('\n');

    const telegramParams = {
        chat_id: chatId,
        text: message
    };


    axios.post(telegramApiUrl, telegramParams)
        .then(response => {
            console.log('Telegram message sent:', response.data);
        })
        .catch(error => {
            console.error('Error sending Telegram message:', error);
        });
}

function readPreviousResponse() {
    try {
        const data = fs.readFileSync('previous_response.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return an empty object if the file doesn't exist or is invalid
        return {};
    }
}

function writeCurrentResponse(responseData) {
    fs.writeFileSync('previous_response.json', JSON.stringify(responseData, null, 2));
}

axios.get(apiUrl, { params: queryParams })
    .then(response => {
        const currentResponse = response.data.results; // Assuming 'data' is the property containing the array
        const previousResponse = readPreviousResponse();
        //        writeCurrentResponse(currentResponse);

        // Compare the current and previous responses
        const newListings = currentResponse.filter(currentItem => {
            return !previousResponse.some(prevItem => prevItem.realEstate.id === currentItem.realEstate.id);
        });

        if (newListings.length > 0) {
            console.log('New listings detected!');

            // Create a scatter plot with the new data
            //createScatterPlot(currentResponse);

            // Save the current response for future comparison
            writeCurrentResponse(currentResponse);

            // Send the new listings data to Telegram
            sendTelegramMessage(newListings);
        } else {
            console.log('No new listings.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });