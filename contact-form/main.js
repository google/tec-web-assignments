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

const form = document.querySelector('#form');
const required = document.querySelectorAll('[required]');
const email = document.querySelector('#email');
const message = document.querySelector('#message');
const agree = document.querySelector('#agree');

// Add a "required" class to all labels for required fields
for (const input of required) {
  input
    // Move up the DOM to find the nearest parent that matches the selector
    .closest('.form--group')
    // Searches within that parent for the first label element
    .querySelector('label')
    // Adds the "required" class to the found label element
    .classList.add('required');
}

// Manage email custom validity
email.addEventListener('input', () => {
  email.setCustomValidity('');
  email.checkValidity();
});

email.addEventListener('invalid', () => {
  if (email.value === '') {
    email.setCustomValidity('Please enter your email address');
  }
});

// Manage message custom validity
message.addEventListener('input', () => {
  message.setCustomValidity('');
  message.checkValidity();
});

message.addEventListener('invalid', () => {
  if (message.value === '') {
    message.setCustomValidity('Please enter a message');
  }
});

// Manage agree custom validity
agree.addEventListener('input', () => {
  agree.setCustomValidity('');
  agree.checkValidity();
});

agree.addEventListener('invalid', () => {
  if (!agree.checked) {
    agree.setCustomValidity('You must agree to the terms and conditions');
  }
});

// Listen for the form being submitted
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get all inputs from the form
  const data = new FormData(e.target);
  // Create an object from the entries
  const submitted = Object.fromEntries(data.entries());

  // Turn the object into a JSON string and put it on the page
  const content = JSON.stringify(submitted, null, 2);
  const output = document.querySelector('#output');
  output.innerText = content;
});
