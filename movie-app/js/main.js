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
import { database } from './database.js';
import './movie.js';

const form = document.querySelector('#search');
const required = document.querySelectorAll('[required]');
const year = document.querySelector('#year');
const output = document.querySelector('#output');
const apikey = document.querySelector('#key');

// Add required class to labels
for (const input of required) {
  input
    .closest('.form--group')
    .querySelector('label')
    .classList.add('required');
}

// Handle custom validation for year
year.setAttribute('max', new Date().getFullYear());
year.addEventListener('input', (e) => {
  year.setCustomValidity('');
  year.checkValidity();
});

// Instead of default error messages, show custom error messages
year.addEventListener('invalid', () => {
  if (Number(year.value) < Number(year.getAttribute('min'))) {
    year.setCustomValidity(
      `Year must be greater than or equal to ${year.getAttribute('min')}`,
    );
  } else if (Number(year.value) > Number(year.getAttribute('max'))) {
    year.setCustomValidity(
      `Year must be less than or equal to ${year.getAttribute('max')}`,
    );
  }
});

// Manage API Key visibility
store.subscribe((state) => {
  console.log(state);
  if (state.key) {
    apikey.value = state.key;
    apikey.closest('.form--group').style.display = 'none';
  } else {
    apikey.closest('.form--group').style.display = 'block';
  }
});

// Manage Movie lookup
store.subscribe(async (state) => {
  const movies = state.movies;
  output.innerHTML = '';
  if (movies.length > 0) {
    for (const movie of movies) {
      const movieElement = document.createElement('movie-element');
      movieElement.setAttribute('poster', movie.Poster);
      movieElement.setAttribute('title', movie.Title);
      movieElement.setAttribute('year', movie.Year);
      movieElement.setAttribute('imdb', movie.imdbID);
      movieElement.setAttribute('notes', state?.notes[movie.imdbID] || '');
      output.append(movieElement);
    }
  } else if (!state.search && state.favorites) {
    if (state.favorites) {
      const db = await database;
      const movies = await Promise.all(
        state.favorites.map((id) => db.get('movies', id)),
      );
      if (movies.length > 0) {
        for (const movie of movies) {
          const movieElement = document.createElement('movie-element');
          movieElement.setAttribute('poster', movie.Poster);
          movieElement.setAttribute('title', movie.Title);
          movieElement.setAttribute('year', movie.Year);
          movieElement.setAttribute('imdb', movie.imdbID);
          movieElement.setAttribute('notes', state?.notes[movie.imdbID] || '');
          output.append(movieElement);
        }
      }
    }
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const search = Object.fromEntries(formData.entries());
  const inputs = form.querySelectorAll('input, button, textarea');

  // Disable all inputs
  for (const input of inputs) {
    input.disabled = true;
  }

  store.search(search);

  // Enable all inputs
  for (const input of inputs) {
    input.disabled = false;
  }
});

form.addEventListener('reset', () => {
  store.reset();
});
