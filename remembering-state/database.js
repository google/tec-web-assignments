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

// Import the Promise IndexedDB helper from IDB
import { openDB } from 'idb';

// Open a database and export it so it can be used elsewhere
export const database = openDB('my-db', 1, {
  upgrade(db) {
    // Create a "comments" object store, with "_id" as the key, and let that key automatically get added (and increment) if it's not already present when being inserted
    db.createObjectStore('comments', {
      keyPath: '_id',
      autoIncrement: true,
    });
  },
});
