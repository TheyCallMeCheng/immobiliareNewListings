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
    console.log("Res written to file")
}

axios.get(apiUrl, { params: queryParams })
    .then(response => {
        const currentResponse = response.data.results; // Assuming 'data' is the property containing the array
        const previousResponse = readPreviousResponse();
        console.log(currentResponse)
        writeCurrentResponse(currentResponse);

        // Compare the current and previous responses
        const newListings = currentResponse.filter(currentItem => {
            console.log(currentItem.realEstate.id)
            return !previousResponse.some(prevItem => {
                console.log("Prev:", prevItem.realEstate.id)
                return prevItem.realEstate.id === currentItem.realEstate.id
            });

        });

        if (newListings.length > 0) {
            console.log('New listings detected!');

            // Create a scatter plot with the new data
            createScatterPlot(currentResponse);

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