document.addEventListener("DOMContentLoaded", () => {
  const dbName = "BloodRequestDB";
  let db;

  // Open the database
  const openDB = () => {
    const request = indexedDB.open(dbName, 8);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains("clearedRequests")) {
        db.createObjectStore("clearedRequests", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      loadClearedRequests();
    };

    request.onerror = (event) => {
      console.error("Database error:", event.target.errorCode);
    };
  };

  // Load cleared requests
  const loadClearedRequests = () => {
    const transaction = db.transaction("clearedRequests", "readonly");
    const store = transaction.objectStore("clearedRequests");
    const request = store.getAll();

    request.onsuccess = (event) => {
      const requests = event.target.result;
      renderRequests(requests);
    };
  };

  // Render the cleared requests table
  const renderRequests = (requests) => {
    const tbody = document.getElementById("clearedRequestsList");
    tbody.innerHTML = "";
    requests.forEach((req) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${req.recipientName}</td>
        <td>💰 ✅</td>
        <td>${req.bloodType}</td>
        <td>${req.units}</td>
        <td>${req.urgency}</td>
      `;
      tbody.appendChild(row);
    });
  };

  // Sorting function
  const sortTable = (column) => {
    const transaction = db.transaction("clearedRequests", "readonly");
    const store = transaction.objectStore("clearedRequests");
    const request = store.getAll();

    request.onsuccess = (event) => {
      let requests = event.target.result;
      requests.sort((a, b) => (a[column] > b[column] ? 1 : -1));
      renderRequests(requests);
    };
  };

  // Filtering function
  const filterUnits = () => {
    const filterValue = document.getElementById("filterUnits").value;
    const transaction = db.transaction("clearedRequests", "readonly");
    const store = transaction.objectStore("clearedRequests");
    const request = store.getAll();

    request.onsuccess = (event) => {
      const requests = event.target.result.filter((req) =>
        req.units.toString().includes(filterValue)
      );
      renderRequests(requests);
    };
  };

  // Print function
  const printReport = () => {
    window.print();
  };

  // Event listeners
  document.querySelectorAll(".sort").forEach((btn) =>
    btn.addEventListener("click", (event) => {
      const column = event.target.dataset.column;
      sortTable(column);
    })
  );

  document.getElementById("filterUnits").addEventListener("input", filterUnits);
  document.getElementById("printButton").addEventListener("click", printReport);

  // Initialize the database
  openDB();
});