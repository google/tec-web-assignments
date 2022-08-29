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

const form = document.querySelector('#search');
const required = document.querySelectorAll('[required]');
const year = document.querySelector('#year');
const output = document.querySelector('#output');

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

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const search = Object.fromEntries(formData.entries());
  const inputs = form.querySelectorAll('input, button, textarea');

  // Remove all previous results. innerHTML is OK here because we're replacing it with an empty string so not potential issue with XSS
  output.innerHTML = '';

  // Disable all inputs
  for (const input of inputs) {
    input.disabled = true;
  }

  try {
    let query = `https://www.omdbapi.com/?apikey=${search.key}&t=${search.title}`;
    if (search.year) {
      query += `&y=${search.year}`;
    }
    if (search.plot) {
      query += `&plot=${search.plot}`;
    }
    const response = await fetch(query);
    const data = await response.json();
    if (data.Response === 'False') {
      // Show error message
      const error = document.createElement('p');
      error.innerText = 'No results found';
      output.append(error);
    }

    // Create an element to hold the movie results
    const movie = document.createElement('figure');
    movie.classList.add('movie');
    // Create an image element for the poster
    const img = document.createElement('img');
    img.src = data.Poster;
    img.alt = `Poster for ${data.Title}`; // Include alt text for screen readers whenever including an image
    movie.append(img); // Add it to the movie results element

    // Create a holder for the movie details
    const caption = document.createElement('figcaption');
    // Create a heading for the movie title
    const title = document.createElement('h2');
    title.innerText = data.Title;
    caption.append(title);
    // Display the year the movie was released
    const year = document.createElement('p');
    year.innerText = data.Year;
    caption.append(year);
    // Display the movie's rating
    const rating = document.createElement('p');
    rating.innerText = data.Rated;
    caption.append(rating);
    // Display the movie's plot
    const plot = document.createElement('p');
    plot.innerText = data.Plot;
    caption.append(plot);

    // Add the caption to the movie results
    movie.append(caption);

    // Add the movie results to the page
    output.append(movie);
  } catch (e) {
    // Show error message
    const error = document.createElement('p');
    error.innerText =
      'There was an error with your search, please check your API key and try again in a few minutes';
    output.append(error);
  }

  // Enable all inputs
  for (const input of inputs) {
    input.disabled = false;
  }
});
