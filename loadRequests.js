document.addEventListener('DOMContentLoaded', () => {
  const dbName = "BloodRequestDB";
  let db;

  // Open IndexedDB
  const openDB = () => {
    const request = indexedDB.open(dbName, 8); // Updated version to 8
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
        if (!db.objectStoreNames.contains('clearedRequests')) {
        db.createObjectStore('clearedRequests', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('sumup')) {
      db.createObjectStore('sumup', { keyPath: 'id', autoIncrement: true });
    }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      loadRequests();
    };

    request.onerror = (event) => {
      console.error("Database error:", event.target.errorCode);
    };
  };

  // Load requests from the 'requests' object store
  const loadRequests = () => {
    const transaction = db.transaction('requests', 'readonly');
    const store = transaction.objectStore('requests');
    const request = store.getAll();

    request.onsuccess = (event) => {
      const requests = event.target.result;
      const tbody = document.getElementById('requestsTableBody');
      const noRequestsMessage = document.getElementById('noRequestsMessage');
      tbody.innerHTML = '';

      if (requests.length === 0) {
        noRequestsMessage.classList.remove('hidden');
      } else {
        noRequestsMessage.classList.add('hidden');
        requests.forEach((req) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${req.recipientName || 'N/A'}</td>
            <td>${req.bloodType || 'N/A'}</td>
            <td>${req.units || 'N/A'}</td>
            <td>${req.urgency || 'N/A'}</td>
            <td>
              <button class="view-btn" data-id="${req.id}"><i class="fa fa-eye"></i> View</button>
              <button class="approve-btn" data-id="${req.id}"><i class="fa fa-check"></i> Approve</button>
              <button class="deny-btn" data-id="${req.id}"><i class="fa fa-times"></i> Deny</button>
            </td>
          `;
          tbody.appendChild(row);
        });

        // Add event listeners for the "View" buttons
        document.querySelectorAll('.view-btn').forEach((btn) =>
          btn.addEventListener('click', (event) => {
            const id = Number(event.target.closest('button').dataset.id);
            viewRequest(id);
          })
        );

        // Add event listeners for the "Approve" buttons
        document.querySelectorAll('.approve-btn').forEach((btn) =>
          btn.addEventListener('click', (event) => {
            const id = Number(event.target.closest('button').dataset.id);
            approveRequest(id);
          })
        );

        // Add event listeners for the "Deny" buttons
        document.querySelectorAll('.deny-btn').forEach((btn) =>
          btn.addEventListener('click', (event) => {
            const id = Number(event.target.closest('button').dataset.id);
            denyRequest(id); // Placeholder function
          })
        );
      }
    };

    request.onerror = (event) => {
      console.error("Error loading requests:", event.target.errorCode);
    };
  };

  // View request details in a modal
  const viewRequest = (id) => {
    const transaction = db.transaction('requests', 'readonly');
    const store = transaction.objectStore('requests');
    const request = store.get(id);

    request.onsuccess = (event) => {
      const data = event.target.result;
      if (data) {
        document.getElementById('viewRecipientName').textContent = data.recipientName || 'N/A';
        document.getElementById('viewAge').textContent = data.age || 'N/A';
        document.getElementById('viewBloodType').textContent = data.bloodType || 'N/A';
        document.getElementById('viewUnits').textContent = data.units || 'N/A';
        document.getElementById('viewUrgency').textContent = data.urgency || 'N/A';
        document.getElementById('viewHospital').textContent = data.hospital || 'N/A';
        document.getElementById('viewDoctor').textContent = data.doctor || 'N/A';
        document.getElementById('viewLocation').textContent = data.location || 'N/A';
        document.getElementById('viewReason').textContent = data.reason || 'N/A';
        document.getElementById('viewTimestamp').textContent = data.timestamp || 'N/A';

        document.getElementById('viewModal').classList.remove('hidden');
      }
    };

    request.onerror = (event) => {
      console.error(`Error retrieving request ID ${id}:`, event.target.errorCode);
    };
  };

  // Approve request (add to approvedRequests store but do not delete from requests store)
  const approveRequest = (id) => {
    const transaction = db.transaction('requests', 'readonly');
    const store = transaction.objectStore('requests');
    const request = store.get(id);

    request.onsuccess = (event) => {
      const data = event.target.result;
      if (data) {
        // Add request to the approvedRequests store
        const approveTransaction = db.transaction('approvedRequests', 'readwrite');
        const approveStore = approveTransaction.objectStore('approvedRequests');
        approveStore.add(data);

        // Show success message
        showMessage('success', 'Record successfully added to Finance 💰, Continue to approved list ✅');
      } else {
        // Show failure message if request not found
        showMessage('error', 'Failed to approve request 😞. Record not found!');
      }
    };

    request.onerror = (event) => {
      console.error(`Error retrieving request ID ${id}:`, event.target.errorCode);
      showMessage('error', 'Failed to approve request 😞. An error occurred!');
    };
  };

  // Placeholder for denyRequest function
  const denyRequest = (id) => {
  console.log(`Deny request ID: ${id}`);

  // Create a popup for denial reasons
  const reasonsPopup = document.createElement('div');
  reasonsPopup.classList.add('popup');
  reasonsPopup.innerHTML = `
    <div class="popup-content">
      <h3>Select Denial Reasons</h3>
      <form id="denyReasonsForm">
        <label><input type="checkbox" name="reason" value="Blood Type Incompatibility"> Blood Type Incompatibility</label><br>
        <label><input type="checkbox" name="reason" value="Insufficient Blood Supply"> Insufficient Blood Supply</label><br>
        <label><input type="checkbox" name="reason" value="Inadequate Testing or Documentation"> Inadequate Testing or Documentation</label><br>
        <label><input type="checkbox" name="reason" value="Risk of Transfusion Reactions"> Risk of Transfusion Reactions</label><br>
        <label><input type="checkbox" name="reason" value="Infection Concerns"> Infection Concerns</label><br>
        <label><input type="checkbox" name="reason" value="Medical Contraindications"> Medical Contraindications</label><br>
        <label><input type="checkbox" name="reason" value="Alternative Treatments"> Alternative Treatments</label><br>
        <label><input type="checkbox" name="reason" value="Ethical or Religious Reasons"> Ethical or Religious Reasons</label><br>
        <label><input type="checkbox" name="reason" value="Insurance/Finance Issues"> Insurance/Finance Issues</label><br>
        <textarea id="additionalNotes" placeholder="Additional notes (optional)" rows="4"></textarea>
        <div class="popup-buttons">
          <button type="submit" class="popup-submit">Submit</button>
          <button type="button" class="popup-cancel">Cancel</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(reasonsPopup);

  // Add event listener to the Cancel button to close the popup
  reasonsPopup.querySelector('.popup-cancel').addEventListener('click', () => {
    document.body.removeChild(reasonsPopup);
  });

  // Add event listener to the Submit button to process the denial
  reasonsPopup.querySelector('#denyReasonsForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const selectedReasons = Array.from(
      reasonsPopup.querySelectorAll('input[name="reason"]:checked')
    ).map((input) => input.value);

    const additionalNotes = document.getElementById('additionalNotes').value;

    if (selectedReasons.length === 0) {
      alert("Please select at least one reason for denial.");
      return;
    }

    // Retrieve the request details and add them to the deniedRequests store
    const transaction = db.transaction('requests', 'readonly');
    const store = transaction.objectStore('requests');
    const request = store.get(id);

    request.onsuccess = (event) => {
      const data = event.target.result;
      if (data) {
        data.denialReasons = selectedReasons;
        data.additionalNotes = additionalNotes;

        const denyTransaction = db.transaction('deniedRequests', 'readwrite');
        const denyStore = denyTransaction.objectStore('deniedRequests');
        denyStore.add(data);

        showMessage('success', 'Request successfully denied 🚫.');
      } else {
        showMessage('error', 'Failed to deny request 😞. Record not found!');
      }
    };

    request.onerror = (event) => {
      console.error(`Error retrieving request ID ${id}:`, event.target.errorCode);
      showMessage('error', 'Failed to deny request 😞. An error occurred!');
    };

    // Remove the popup after processing
    document.body.removeChild(reasonsPopup);
  });
};

  // Show success or failure message
  const showMessage = (type, message) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => messageElement.remove(), 5000); // Remove message after 5 seconds
  };

  // Close the view modal
  document.getElementById('closeViewModal').addEventListener('click', () => {
    document.getElementById('viewModal').classList.add('hidden');
  });

  openDB();
});