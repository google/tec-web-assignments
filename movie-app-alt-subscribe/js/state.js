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

// Import our database
import { database } from './database';

// Create a new state manager
class StoreManager {
  constructor(init = {}) {
    // Grab the current "this" context
    const self = this;
    // Create an array for subscribers
    this._subscribers = {};

    // // Wait for our database to be ready
    database.then(async (db) => {
      // When ready, make the database available to the state manager
      this.db = db;

      // Get the key from the database
      const key = await db.get('settings', 'key');
      if (key) {
        this._state.key = key;
      }

      // Get favorites from the database
      const favorites = await db.get('settings', 'favorites');
      if (favorites) {
        this._state.favorites = favorites;
      }

      // Get notes from the database
      const notes = await db.getAll('notes');
      if (notes.length) {
        this._state.notes =
          Object.fromEntries(notes.map(({ imdbID, note }) => [imdbID, note])) ||
          {};
      }
    });

    // Create the internal state proxy
    this._state = new Proxy(init, {
      // Make set an async function so we can use our database to save it when it's updated
      async set(target, key, value) {
        // Set the key equal to the value
        target[key] = value;

        // Save items to the database, if it's available
        if (self.db) {
          if (key === 'key') {
            await self.db.put('settings', value, 'key');
          }

          if (key === 'favorites') {
            await self.db.put('settings', value, 'favorites');
            const movies = target.movies
              .filter((movie) => value.includes(movie.imdbID))
              .map((movie) => self.db.put('movies', movie));

            await Promise.all(movies);
          }

          if (key === 'notes') {
            await Promise.all(
              Object.entries(value).map(([id, note]) =>
                self.db.put('notes', { note, imdbID: id }),
              ),
            );
          }
        }

        // Loop through each subscriber and call them
        if (self._subscribers._all) {
          for (const subscriber of self._subscribers._all) {
            subscriber(target);
          }
        }

        if (self._subscribers[key]) {
          for (const subscriber of self._subscribers[key]) {
            subscriber(target);
          }
        }

        // Return true to indicate that the set was successful
        return true;
      },
    });
  }

  // Let things subscribe to the state manager
  subscribe(cb, keys = ['_all']) {
    if (typeof cb !== 'function') {
      throw new Error('Callback is not a function');
    }

    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    // Let subscribers subscribe to specific key changes
    for (const key of keys) {
      if (!this._subscribers[key]) {
        this._subscribers[key] = [];
      }
      this._subscribers[key].push(cb);
    }
    cb(this._state);
  }

  // Get the current state
  state(key) {
    if (key) {
      return this._state[key];
    }
    return this._state;
  }

  // Action to add a comment to the state
  search(lookup) {
    if (lookup.key) {
      this._state.key = lookup.key;
    }

    this._state.search = {
      title: lookup.title,
      year: lookup.year || '',
    };

    this._state.error = '';

    this.movieLookup();
  }

  reset() {
    this._state.search = null;
    this._state.movies = [];
  }

  toggleFavorite(id) {
    const favorites = this.state('favorites') || [];

    if (favorites.includes(id)) {
      favorites.splice(favorites.indexOf(id), 1);
    } else {
      favorites.push(id);
    }

    this._state.favorites = favorites;
  }

  setNote(id, note) {
    const notes = this.state('notes') || {};
    notes[id] = note;
    this._state.notes = notes;
  }

  async movieLookup() {
    let key = this.state('key');
    let search = this.state('search');

    if (!key) {
      return (this._state.error = 'No API Key');
    }

    let query = `https://www.omdbapi.com/?apikey=${key}&s=${search.title}`;
    if (search.year) {
      query += `&y=${search.year}`;
    }

    try {
      const response = await fetch(query);
      const data = await response.json();
      if (data.Response === 'False') {
        // Show error message
        this._state.error = data.Error;
      }

      // Make sure this is an array
      if (Array.isArray(data.Search)) {
        this._state.movies = data.Search;
      } else {
        this._state.movies = [];
      }
    } catch (e) {
      this._state.error = e.message;
    }
  }
}

export const store = new StoreManager({ search: '', movies: [] });
