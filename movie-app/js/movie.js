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
    return ['poster', 'title', 'year', 'imdb', 'notes', 'visible-notes'];
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

    if (name === 'notes') {
      this._notes.textContent = newValue;
    }

    if (name === 'visible-notes') {
      console.log('Hello');
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
      store.toggleNoteVisibility(id);
    });

    store.subscribe((state) => {
      // Manage notes visibility
      if (state.visibleNotes) {
        if (state.visibleNotes[id]) {
          this._showNotes.textContent = 'Hide notes';
          this._notes.classList.remove('hidden');

          // Set the cursor at the end of the text area's length
          const end = this._notes.value.length;
          this._notes.setSelectionRange(end, end);
          this._notes.focus();
        } else {
          this._showNotes.textContent = 'Show notes';
          this._notes.classList.add('hidden');
        }
      }

      // Manage favoriting
      if (state?.favorites?.includes(id)) {
        this._favorite.textContent = 'Unfavorite';
      } else {
        this._favorite.textContent = 'Favorite';
      }
    });
  }
}

if (customElements.get('movie-element') === undefined) {
  customElements.define('movie-element', Movie);
}
