const fs = require('fs-extra');
const fetch = require('node-fetch');

class Checker {
    constructor() {
        this.api = 'https://fortnite-public-api.theapinetwork.com/prod09/users/id?username=';
        this._init();
    }

    log(...args) { console.log(...args) }

    async _init() {
        let input = await fs.exists('./input.txt');

        if (!input) {
            this.log("Looks like you don't have an input.txt file! Trying to create it...");
            await fs.ensureFile('./input.txt');
            return this.log('File has been created, please enter the accounts you want to check! (make sure each one is on a new line)\nRun npm start once again once you\'ve done this!')
        }

        input = await fs.readFile('./input.txt');
        input = input.toString();

        if (input.length <= 1) return this.log("It looks like you haven't entered the accounts you want to check yet!")

        const usernames = input.split('\n').map(u => u.replace('\r', ''));
        const available = new Array();

        await this.check(usernames, available);
        if (available.length < 1) return this.log("I'm sorry to disappoint you, but no account is available.")
        await fs.outputFile('./output.txt', available.join('\n'));
        return this.log('Verification complete. Please check your output.txt file for all the available accounts!')
    }

    async check(usernames, available) {
        for (let i = 0; i < usernames.length; i++) {
            if (usernames[i].length > 16) { this.log(`The ${usernames[i]} username is longer than the character limit (16), skipping over it.`); continue; }
            let res = await fetch(this.url(usernames[i]));
            if (res.status != 200) throw new Error('Something went wrong! The Fortnite API may be currently down');
            res = await res.json();
            if (res.error && res.errorMessage === 'unknown_epic_user') { available.push(usernames[i]); continue; }
        };
    }

    url(username) {
        return this.api + username;
    }
}

new Checker();