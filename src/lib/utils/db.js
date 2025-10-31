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

export async function getAllFiles() {
  const db = await openDB();
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);

  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}
