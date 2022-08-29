/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { store } from './state.js';

class Movie extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = document
      .querySelector('#movie-template')
      .content.cloneNode(true);
    shadow.append(template);

    this._poster = this.shadowRoot.querySelector('.movie--poster');
    this._title = this.shadowRoot.querySelector('.movie--title');
    this._year = this.shadowRoot.querySelector('.movie--year');

    this._favorite = this.shadowRoot.querySelector('.movie--favorite');
    this._showNotes = this.shadowRoot.querySelector('.movie--show-notes');
    this._notes = this.shadowRoot.querySelector('.movie--notes');
  }

  static get observedAttributes() {
    return ['poster', 'title', 'year', 'imdb'];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'poster') {
      this._poster.src = newValue;
      this._poster.alt = `Poster for ${this.title}`;
    }

    if (name === 'title') {
      this._title.textContent = newValue;
    }

    if (name === 'year') {
      this._year.textContent = newValue;
    }
  }

  connectedCallback() {
    const id = this.getAttribute('imdb');

    this._favorite.addEventListener('click', () => {
      store.toggleFavorite(id);
    });

    this._notes.addEventListener('input', (e) => {
      store.setNote(id, e.target.value);
    });

    this._showNotes.addEventListener('click', () => {
      this._notes.classList.toggle('hidden');
      if (this._notes.classList.contains('hidden')) {
        this._showNotes.textContent = 'Show notes';
      } else {
        this._showNotes.textContent = 'Hide notes';
      }
    });

    store.subscribe(
      (state) => {
        // Make sure the notes match what's in the state
        if (this._notes.textContent !== state.notes[id]) {
          this._notes.textContent = state.notes[id];
        }

        // Manage favoriting
        if (state?.favorites?.includes(id)) {
          this._favorite.textContent = 'Unfavorite';
        } else {
          this._favorite.textContent = 'Favorite';
        }
      },
      ['notes', 'favorites'],
    );
  }
}

if (customElements.get('movie-element') === undefined) {
  customElements.define('movie-element', Movie);
}
