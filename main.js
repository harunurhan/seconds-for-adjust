void function () {
  // TODO: extract this as `lib`
  class SecondsRequestManager {
    constructor(apiUrl) {
      this.sentSeconds = new Set();
      this.activeRequestAbortController = null;
      this.latestRequestPromise = Promise.resolve();
      this.apiUrl = apiUrl;
    }

    abortActiveRequest() {
      if (this.activeRequestAbortController) {
        this.activeRequestAbortController.abort();
        this.activeRequestAbortController = null;
        this.latestRequestPromise = Promise.resolve();
      }
    }

    sendCurrentSeconds() {
      const currentSeconds = new Date().getSeconds();

      if (this.sentSeconds.has(currentSeconds)) {
        console.warn(`${currentSeconds} has been already sent before`);
        return;
      }

      this.sentSeconds.add(currentSeconds);
      const abortController = new AbortController();
      const requestPromise = fetch(this.apiUrl, {
        body: JSON.stringify({ seconds: currentSeconds }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: abortController.signal,
      });

      this.latestRequestPromise = this.latestRequestPromise
        .then(() => {
          this.activeRequestAbortController = abortController;
          return requestPromise.then(
            (response) => response.json()
          ).then(({ id, seconds }) => {
            console.log(`id: ${id}, seconds: ${seconds}`);
          });
          // TODO: handle errors
        });
    }
  }

  const manager = new SecondsRequestManager('https://jsonplaceholder.typicode.com/posts');

  const button = document.getElementById('button');
  button.addEventListener('click', () => {
    manager.sendCurrentSeconds();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      manager.abortActiveRequest();
    }
  });
}();