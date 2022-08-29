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
    this._subscribers = [];

    // Wait for our database to be ready
    database.then(async (db) => {
      // When ready, make the database available to the state manager
      this.db = db;

      // Get all the comments in the database
      const comments = await db.getAll('comments');
      // Set the comments state to the comments in the database
      this._state.comments = comments;

      // Call the filter function to make sure we get our properly filtered list
      this.filter();
    });

    // Create the internal state proxy
    this._state = new Proxy(init, {
      // Make set an async function so we can use our database to save it when it's updated
      async set(target, key, value) {
        // Set the key equal to the value
        target[key] = value;

        // If our database is available, save the state to the database
        if (self.db) {
          // If the key is "comments", save it to IndexedDB
          if (key === 'comments') {
            // Get the last comment in the array, which will be the one most recently added
            const item = value[value.length - 1];

            // _id comes from the database. Don't try to save it if it already has one
            if (item && !item?._id) {
              // Save the item to the database
              await self.db.add('comments', item);
            }
          }
        }

        // Loop through each subscriber and call them
        for (const subscriber of self._subscribers) {
          subscriber(target);
        }

        // Return true to indicate that the set was successful
        return true;
      },
    });
  }

  // Let things subscribe to the state manager
  subscribe(cb) {
    if (typeof cb !== 'function') {
      throw new Error('Callback is not a function');
    }
    this._subscribers.push(cb);
    cb(this._state);
  }

  // Action to add a comment to the state
  addComment(comment) {
    if (!comment.date) {
      comment.date = new Date();
    }

    this._state.comments.push(comment);
    this._state.comments = this._state.comments;

    // Call the filter function to update the filtered state
    this.filter();
  }

  // Action to filter the list of comments
  filter(options = {}) {
    // Get the current filter state, and merge it with the passed in options
    const filters = Object.assign(this._state.filters || {}, options);

    // Update the current filter state
    this._state.filters = filters;

    // Filter the comments based on the filters
    this._state.filtered = this._state.comments.filter((comment) => {
      // If there is a name filter, return whether the comment's name includes the filter's name, otherwise return true
      const name = filters.name
        ? comment.name.toLowerCase().includes(filters.name.toLowerCase())
        : true;
      // If there is an email filter, return whether the comment's email includes the filter's email, otherwise return true
      const email = filters.email
        ? comment.email.toLowerCase().includes(filters.email.toLowerCase())
        : true;
      // If there is a length filter, return whether the comment's length is greater than or equal to the filter's length, otherwise return true
      const length = !isNaN(Number(filters.length))
        ? comment.body.length >= Number(filters.length)
        : true;

      // Return whether all of the above are true
      return name && email && length;
    });
  }

  // Reset the filter
  filterReset() {
    // Reset the filter state
    this._state.filters = {};
    // Call the filter function to update the filtered state
    this.filter();
  }
}

export const store = new StoreManager({ comments: [], filtered: [] });
