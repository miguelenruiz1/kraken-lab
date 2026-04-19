const { setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');

class KrakenWorld {
  constructor(input) {
    const params = input.parameters;
    this.userId = params.id;
    this.device = params.device || {};
    this.testScenarioId = params.testScenarioId;
    this.attach = input.attach;
  }
}

setWorldConstructor(KrakenWorld);
setDefaultTimeout(90 * 1000);
