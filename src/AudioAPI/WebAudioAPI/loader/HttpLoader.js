import Loader from './Loader';

export default class extends Loader {

  /**
   * Loads an audio file via XHR.
   */
  load() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('GET', this.src, true);
      xhr.responseType = 'arraybuffer';
      
      xhr.addEventListener('load', (e) => {
        const decoderPromise = super.fileLoad(e);
        decoderPromise.then((audioBuffer) => {
          resolve(audioBuffer);
        });
      });

      xhr.addEventListener('error', () => {
        reject(Error(`Track ${this.src} failed to load`));
      });

      xhr.send();
    });
  }
}
