const dbName = "fileSystemDB";
const storeName = "files";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore(storeName, { keyPath: "path" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });
}

export async function saveFiles(files) {
  const db = await openDB();
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  for (const file of files) store.put(file);
  return tx.complete;
}

export async function getFile(path) {
  const db = await openDB();
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  return new Promise((resolve) => {
    const req = store.get(path);
    req.onsuccess = () => resolve(req.result);
  });
}

export async function getAll() {
  const db = await openDB();
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);

  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

// Create a new notebook (folder structure)
export async function createNotebook(notebookPath) {
  const db = await openDB();
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);

  // Create a marker file to represent the notebook
  const marker = {
    path: `${notebookPath}`,
  };

  return new Promise((resolve, reject) => {
    const req = store.put(marker);
    req.onsuccess = () => {
      tx.oncomplete = () => resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

// Create a new note in a notebook
export async function createNote(notePath, initialContent = null) {
  const content = initialContent || {
    blocks: [
      {
        type: "header",
        data: { text: "Untitled Note", level: 2 },
      },
    ],
  };

  await saveFiles([{ path: notePath, content }]);
}

// Delete a file or notebook (and all its contents)
export async function deleteItem(path) {
  const db = await openDB(); // your existing openDB
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);

  const allFiles = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  await Promise.all(
    allFiles
      .filter((file) => file.path === path || file.path.startsWith(path + "/"))
      .map((file) => store.delete(file.path))
  );

  await tx.done;
}

// Rename a file or notebook
export async function renameItem(oldPath, newPath) {
  const db = await openDB();
  const allFiles = await getAll();

  // Find all files that need to be renamed
  const toRename = allFiles.filter(
    (f) => f.path === oldPath || f.path.startsWith(oldPath + "/")
  );

  // Create new entries with updated paths
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);

  for (const file of toRename) {
    const updatedPath = file.path.replace(oldPath, newPath);
    store.delete(file.path);
    store.put({ ...file, path: updatedPath });
  }

  return tx.complete;
}

// Check if a path already exists
export async function pathExists(path) {
  const file = await getFile(path);
  return !!file;
}
