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

import './comment.js';
import { store } from './state.js';

// Grab elements from the DOM
const required = document.querySelectorAll('[required]');
const form = document.querySelector('#comment-form');
const comments = document.querySelector('#comments');

// Add required class to required labels
for (const input of required) {
  input
    .closest('.form--group')
    .querySelector('label')
    .classList.add('required');
}

// Listen to form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // Grab the form data as an object
  const data = Object.fromEntries(new FormData(form).entries());
  console.log(data);

  store.addComment(data);

  // Extra Credit: Reset the form and puts the cursor into the first input
  // Resets the form
  e.target.reset();
  // Finds the first input in the form and focuses it
  e.target.querySelector('input, textarea, button').focus();
});

// Subscribe to the store to render comments
store.subscribe((state) => {
  // Grab the comments from the store
  const allComments = state.filtered;
  console.log(allComments);

  // Removes all existing comments so we can re-render them
  comments.innerHTML = '';

  // Loops over each comment, creates a custom my-comment element, sets the appropriate attributes, and appends it to the comments section
  for (const comment of allComments) {
    const myComment = document.createElement('my-comment');
    myComment.setAttribute('name', comment.name);
    myComment.setAttribute('email', comment.email);
    myComment.setAttribute('body', comment.body);
    myComment.setAttribute('time', comment.date);
    comments.append(myComment);
  }
});

// Manage Filters
const filters = document.querySelector('#filters');
// Listen for the submit event on the filter form
filters.addEventListener('submit', (e) => {
  e.preventDefault();
  // Grab the form data as an object
  const data = Object.fromEntries(new FormData(filters).entries());
  // Format it into a filter options object
  const options = {
    name: data['name-filter'],
    email: data['email-filter'],
    length: data['length-filter'],
  };
  // Call the filter
  store.filter(options);
});

// On form reset, also reset the filters in the state manager
filters.addEventListener('reset', (e) => {
  store.filterReset();
  e.target.querySelector('input, textarea, button').focus();
});

// Super bonus! Filter while someone types!
// filters.addEventListener('input', (e) => {
//   e.preventDefault();
//   // Grab the form data as an object
//   const data = Object.fromEntries(new FormData(filters).entries());
//   // Format it into a filter options object
//   const options = {
//     name: data['name-filter'],
//     email: data['email-filter'],
//     length: data['length-filter'],
//   };
//   // Call the filter
//   store.filter(options);
// });
