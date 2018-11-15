const fs = require('fs-extra');
const superagent = require('superagent');

class Checker {
    constructor() {
        this.api = 'https://fortnite-public-api.theapinetwork.com/prod09/users/id&username=';
        this._init();
    }

    async _init() {
        let input = await fs.exists('./input.txt');

        if (!input) {
        console.log("Looks like you don't have an input.txt file! Trying to create it...");
        await fs.ensureFile('./input.txt');
        return console.log('File has been created, please enter the accounts you want to check! (make sure each one is on a new line)')
        }

        input = await fs.readFile('./input.txt');
        input = input.toString();
        if (input.length <= 1) return console.log("It looks like you haven't entered the accounts you want to check yet!")

        const usernames = input.split('\n');
        const available = new Array();

        await this.check(usernames, available);
        if (available.length < 1) return console.log("I'm sorry to disappoint you, but no account is available.")
        await fs.outputFile('./output.txt', available.join('\n'));
        console.log('Verification complete. Please check your output.txt file for all the available accounts!')
    }

    async check(usernames, available) {
        for (let i = 0; i <= usernames.length; i++) {
            let { res } = await superagent.get(this.url(usernames[i]));
            res = JSON.parse(res.text);
            if (res.error && res.errorMessage === 'unknown_epic_user') { available.push(usernames[i]); continue; }
        };
    }

    url(username) {
        return this.api + username;
    }
}

new Checker();