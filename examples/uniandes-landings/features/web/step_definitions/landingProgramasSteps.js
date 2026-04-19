const { Given, When, Then } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

// Expand Kraken-style <PROPERTY> placeholders embedded in URLs or other
// templated strings. PropertyManager (Mario's utility) only resolves when the
// whole string is the property; for concatenated values like
// "<LANDING_BASE_URL>/es/programas/medicina" we read properties.json from the
// current working directory (the project root where kraken-node run was invoked).
function expandProperties(text) {
  if (!text || typeof text !== 'string') return text;
  const propertiesPath = path.join(process.cwd(), 'properties.json');
  if (!fs.existsSync(propertiesPath)) return text;
  let properties;
  try {
    properties = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));
  } catch {
    return text;
  }
  return text.replace(/<([A-Z0-9_]+)>/g, (match, key) => properties[key] || match);
}

// Given: navigate to the program landing page (expands <LANDING_BASE_URL> etc.)
Given('Ingreso a la landing page del programa {kraken-string}', async function (url) {
  const resolved = expandProperties(url);
  this.__currentUrl = resolved;
  await this.driver.url(resolved);
  // Let Drupal CSS/JS settle
  await this.driver.pause(2000);
  // Dismiss the Usercentrics cookie consent overlay so it doesn't intercept
  // subsequent clicks. The banner is rendered inside #usercentrics-root.
  await this.driver
    .execute(() => {
      const overlay = document.getElementById('usercentrics-root');
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    })
    .catch(() => undefined);
});

// Then: SEO title contains expected substring
Then('el título SEO de la página debe contener {kraken-string}', async function (expected) {
  const title = await this.driver.getTitle();
  expect(title).to.include(expected);
});

// Then: hero / main title visible with the program name
Then('la página debe mostrar el título principal {kraken-string}', async function (expected) {
  const body = await this.driver.$('body');
  const text = await body.getText();
  expect(text.toLowerCase()).to.include(expected.toLowerCase());
});

// Then: breadcrumbs contain Inicio and Programas
Then('los breadcrumbs deben ser correctos', async function () {
  const candidates = [
    'nav.breadcrumb',
    '.breadcrumb',
    '[aria-label="breadcrumb"]',
    'ol.breadcrumb',
  ];
  let breadcrumbs;
  for (const selector of candidates) {
    const element = await this.driver.$(selector);
    if (await element.isExisting()) {
      breadcrumbs = element;
      break;
    }
  }
  if (!breadcrumbs) throw new Error('Breadcrumbs container not found on the page');
  const text = (await breadcrumbs.getText()) || '';
  expect(text).to.include('Inicio');
  expect(text).to.include('Programas');
});

// Then: key information section shows a reasonable subset of program metadata
Then('la sección de Información Clave debe mostrar los datos generales', async function () {
  const body = await this.driver.$('body');
  const text = (await body.getText()) || '';
  expect(/Informaci[oó]n clave/i.test(text)).to.equal(true);
  const fields = [
    /Sede/i,
    /Cr[eé]ditos/i,
    /Horario/i,
    /T[ií]tulo otorgado/i,
    /Semestres/i,
    /SNIES/i,
  ];
  const matches = fields.filter((rx) => rx.test(text)).length;
  expect(matches).to.be.at.least(2);
});

// Then: important dates section is present
Then('la sección de Fechas Importantes debe estar visible', async function () {
  const body = await this.driver.$('body');
  const text = (await body.getText()) || '';
  expect(/Fechas importantes/i.test(text)).to.equal(true);
  expect(/Inicio de inscripciones|Cierre|inscripciones/i.test(text)).to.equal(true);
});

// Then: related programs section has additional cards
Then('la sección de Programas de tu interés debe mostrar tarjetas adicionales', async function () {
  const body = await this.driver.$('body');
  const text = (await body.getText()) || '';
  expect(/PROGRAMAS RELACIONADOS|Programas de tu interés/i.test(text)).to.equal(true);
});

// When: click on an internal tab of the program landing by its visible name
When('hago clic en la pestaña {kraken-string}', async function (tabName) {
  const anchors = await this.driver.$$('a');
  for (const anchor of anchors) {
    const text = await anchor.getText().catch(() => '');
    if (new RegExp(tabName, 'i').test(text)) {
      await anchor.scrollIntoView({ block: 'center' }).catch(() => undefined);
      await anchor.click().catch(async () => {
        await this.driver.execute((el) => el.click(), anchor);
      });
      await this.driver.pause(1000);
      return;
    }
  }
  throw new Error(`Tab link "${tabName}" not found`);
});

// Then: after clicking a tab, the named content becomes present in the DOM
Then('el contenido de {kraken-string} debe volverse visible o enfocado', async function (contentTitle) {
  const body = await this.driver.$('body');
  const text = (await body.getText()) || '';
  expect(new RegExp(contentTitle, 'i').test(text)).to.equal(true);
});

// When: submit the undergraduate form while it is empty
When('intento enviar el formulario de pregrado estando vacío', async function () {
  const submit = await this.driver.$('#edit-actions-submit');
  await submit.scrollIntoView({ block: 'center' }).catch(() => undefined);
  await submit.click().catch(async () => {
    await this.driver.execute((el) => el.click(), submit);
  });
  await this.driver.pause(1000);
});

// Then: after empty submit, the form must surface validation errors
Then('el sistema debe resaltar los campos obligatorios pidiendo ser rellenados', async function () {
  const currentUrl = await this.driver.getUrl();
  expect(currentUrl).to.not.include('/es/thank-you-page-programas');

  const errorBox = await this.driver.$('.messages--error, .alert-danger');
  const boxVisible = await errorBox.isExisting();
  const invalidCount = (await this.driver.$$('input:invalid, select:invalid, .error')).length;
  expect(boxVisible || invalidCount > 0).to.equal(true);
});

// When: fill the form with valid data and submit it end-to-end
When('diligencio el formulario de programa pregrado en la landing y lo registro', async function () {
  const data = freshFormData();

  const tipoId = await this.driver.$('#edit-00n1i00000mrkbi');
  await tipoId.selectByVisibleText(data.tipoIdentificacion).catch(async () => {
    await tipoId.selectByAttribute('label', data.tipoIdentificacion).catch(() => undefined);
  });

  await (await this.driver.$('#edit-00n1i00000mrkbg')).setValue(data.numeroIdentificacion);
  await (await this.driver.$('#edit-first-name')).setValue(data.nombre);
  await (await this.driver.$('#edit-last-name')).setValue(data.apellidos);
  await (await this.driver.$('#edit-email')).setValue(data.email);
  await (await this.driver.$('#edit-mobile')).setValue(data.celular);

  await (await this.driver.$('#edit-00nrm000008rbsb')).selectByAttribute('value', '0').catch(() => undefined);
  await (await this.driver.$('#edit-00n1i00000ndlt7')).selectByIndex(1).catch(() => undefined);

  await (await this.driver.$('#edit-00n8w00000pwhhs-s')).click().catch(() => undefined);
  await (await this.driver.$('#edit-00n8w00000pwhhn-s')).click().catch(() => undefined);
  await (await this.driver.$('#edit-00nrm000008mcft')).click().catch(() => undefined);

  const submit = await this.driver.$('#edit-actions-submit');
  await submit.scrollIntoView({ block: 'center' }).catch(() => undefined);
  await submit.click().catch(async () => {
    await this.driver.execute((el) => el.click(), submit);
  });
  await this.driver.waitUntil(async () => {
    const url = await this.driver.getUrl();
    return /thank-you-page-programas/.test(url);
  }, { timeout: 60000, timeoutMsg: 'Did not redirect to thank-you-page-programas within 60s' });
});

// Then: the form submission redirects to the thank-you page with the expected heading
Then('la página debería redireccionarme a la thankyou page {kraken-string}', async function (_thankYouSlug) {
  const url = await this.driver.getUrl();
  expect(url).to.include('/es/thank-you-page-programas');
  const heading = await this.driver.$('h1*=¡Gracias!');
  expect(await heading.isExisting()).to.equal(true);
});

// ---- helpers ----

function freshFormData() {
  return {
    tipoIdentificacion: 'C - Cédula de Ciudadanía',
    numeroIdentificacion: '1023456789',
    nombre: 'Juan Sebastián',
    apellidos: 'Tester Automatizado',
    email: `tester.pregrado.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`,
    celular: '3001234567',
  };
}
