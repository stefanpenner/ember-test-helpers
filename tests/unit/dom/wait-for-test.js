import { module, test } from 'qunit';
import { waitFor, setContext, unsetContext } from '@ember/test-helpers';

module('DOM Helper: waitFor', function(hooks) {
  let context, rootElement;

  hooks.beforeEach(function() {
    // used to simulate how `setupRenderingTest` (and soon `setupApplicationTest`)
    // set context.element to the rootElement
    rootElement = document.querySelector('#qunit-fixture');
    context = {
      element: rootElement,
    };
  });

  hooks.afterEach(function() {
    unsetContext();
  });

  test('wait for selector without context set', async function(assert) {
    assert.rejects(() => {
      return waitFor('.something');
    }, /Must setup rendering context before attempting to interact with elements/);
  });

  test('wait for selector', async function(assert) {
    setContext(context);

    let waitPromise = waitFor('.something');

    setTimeout(() => {
      rootElement.innerHTML = `<div class="something">Hi!</div>`;
    }, 10);

    let element = await waitPromise;

    assert.equal(element.textContent, 'Hi!');
  });

  test('wait for count of selector', async function(assert) {
    setContext(context);

    let waitPromise = waitFor('.something', { count: 2 });

    setTimeout(() => {
      rootElement.innerHTML = `<div class="something">No!</div>`;
    }, 10);

    setTimeout(() => {
      rootElement.innerHTML = `
        <div class="something">Hi!</div>
        <div class="something">Bye!</div>
      `;
    }, 20);

    let elements = await waitPromise;

    assert.deepEqual(elements.map(e => e.textContent), ['Hi!', 'Bye!']);
  });

  test('wait for selector with timeout', async function(assert) {
    assert.expect(2);

    setContext(context);

    let start = Date.now();
    try {
      await waitFor('.something', { timeout: 100 });
    } catch (error) {
      let end = Date.now();
      assert.ok(end - start >= 100, 'timed out after correct time');
      assert.equal(error.message, 'waitUntil timed out');
    }
  });
});