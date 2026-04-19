const { After, Before } = require('@cucumber/cucumber');
const { AndroidClient } = require('kraken-node');

Before(async function () {
  this.deviceClient = new AndroidClient({}, this.userId, (this.parameters && this.parameters.mobile_info) || {});
  this.driver = await this.deviceClient.startKrakenForUserId(this.userId);
});

After(async function () {
  await this.deviceClient.stopKrakenForUserId(this.userId);
});
