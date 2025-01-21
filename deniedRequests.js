document.addEventListener('DOMContentLoaded', () => {
  const dbName = "BloodRequestDB";
  let db;

  // Open IndexedDB
  const openDB = () => {
    const request = indexedDB.open(dbName, 8);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('deniedRequests')) {
        db.createObjectStore('deniedRequests', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('approvedRequests')) {
        db.createObjectStore('approvedRequests', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('clearedRequests')) {
        db.createObjectStore('clearedRequests', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('sumup')) {
  db.createObjectStore('sumup', { keyPath: 'id', autoIncrement: true });
}
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      loadDeniedRequests(); // Load denied requests on success
    };

    request.onerror = (event) => {
      console.error("Database error:", event.target.errorCode);
    };
  };

  // Load denied requests into the table
  const loadDeniedRequests = () => {
    const transaction = db.transaction('deniedRequests', 'readonly');
    const store = transaction.objectStore('deniedRequests');
    const request = store.getAll();

    request.onsuccess = (event) => {
      const requests = event.target.result;
      const tbody = document.getElementById('deniedRequestsList');

      // Clear the existing table rows
      tbody.innerHTML = '';

      // Populate table rows with denied request data
      requests.forEach((req) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${req.recipientName || 'N/A'}</td>
          <td>${req.bloodType || 'N/A'}</td>
          <td>${req.units || 'N/A'}</td>
          <td>${req.urgency || 'N/A'}</td>
          <td>${(req.denialReasons || []).join(", ") || 'Not Provided'}</td>
          <td>
            <button class="view-btn" data-id="${req.id}">View</button>
            <button class="revert-btn" data-id="${req.id}">Revert</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      // Attach event listeners to buttons
      document.querySelectorAll('.view-btn').forEach((btn) =>
        btn.addEventListener('click', viewRequest)
      );

      document.querySelectorAll('.revert-btn').forEach((btn) =>
        btn.addEventListener('click', revertToPending)
      );
    };

    request.onerror = (event) => {
      console.error("Error loading denied requests:", event.target.errorCode);
    };
  };

  // View request details in a popup
  const viewRequest = (event) => {
    const id = Number(event.target.dataset.id);

    const transaction = db.transaction('deniedRequests', 'readonly');
    const store = transaction.objectStore('deniedRequests');
    const request = store.get(id);

    request.onsuccess = (event) => {
      const data = event.target.result;

      if (data) {
        const viewModal = document.getElementById('viewModal');
        viewModal.querySelector('#viewRecipientName').textContent = data.recipientName || 'N/A';
        viewModal.querySelector('#viewAge').textContent = data.age || 'N/A';
        viewModal.querySelector('#viewBloodType').textContent = data.bloodType || 'N/A';
        viewModal.querySelector('#viewUnits').textContent = data.units || 'N/A';
        viewModal.querySelector('#viewUrgency').textContent = data.urgency || 'N/A';
        viewModal.querySelector('#viewDenialReasons').textContent = (data.denialReasons || []).join(", ") || 'N/A';
        viewModal.querySelector('#viewAdditionalNotes').textContent = data.additionalNotes || 'N/A';

        viewModal.classList.remove('hidden');
      }
    };

    request.onerror = (event) => {
      console.error(`Error retrieving request ID ${id}:`, event.target.errorCode);
    };
  };

  // Close the view modal
  document.getElementById('closeViewModal').addEventListener('click', () => {
    document.getElementById('viewModal').classList.add('hidden');
  });

  // Revert a denied request to the pending requests list
  const revertToPending = (event) => {
    const id = Number(event.target.dataset.id);

    const transaction = db.transaction(['deniedRequests', 'requests'], 'readwrite');
    const deniedStore = transaction.objectStore('deniedRequests');
    const pendingStore = transaction.objectStore('requests');

    const getRequest = deniedStore.get(id);

    getRequest.onsuccess = (event) => {
      const data = event.target.result;

      if (data) {
        pendingStore.add(data).onsuccess = () => {
          deniedStore.delete(id).onsuccess = () => {
            console.log(`Request ID ${id} reverted to pending.`);
            loadDeniedRequests(); // Refresh the table
          };
        };
      }
    };

    getRequest.onerror = (event) => {
      console.error(`Error retrieving request ID ${id}:`, event.target.errorCode);
    };
  };

  // Initialize the database and load denied requests
  openDB();
});