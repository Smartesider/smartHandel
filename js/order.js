class OrderSystem {
  constructor() {
    this.apiBaseUrl = 'https://smart-handel.vercel.app/api';
    this.init();
  }

  init() {
    this.createModal();
    this.attachEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div id="order-modal" class="order-modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Fullfør din bestilling</h2>
            <button class="close-modal">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="order-summary">
              <h3>Valgt pakke</h3>
              <div class="package-details">
                <span id="selected-package">Standard bedrift</span>
                <span id="selected-price">kr 9,990</span>
              </div>
            </div>

            <form id="customer-form">
              <div class="form-group">
                <label for="full-name">Fullt navn *</label>
                <input type="text" id="full-name" name="fullName" required>
              </div>

              <div class="form-group">
                <label for="company-name">Firmanavn</label>
                <input type="text" id="company-name" name="company">
              </div>

              <div class="form-group">
                <label for="org-number">Organisasjonsnummer</label>
                <input type="text" id="org-number" name="orgNumber">
              </div>

              <div class="form-group">
                <label for="email">E-post *</label>
                <input type="email" id="email" name="email" required>
              </div>
            </form>

            <div class="payment-buttons">
              <button id="pay-with-stripe" class="btn btn-primary">
                Betal med kort
              </button>
              <button id="request-invoice" class="btn btn-secondary">
                Send faktura
              </button>
            </div>

            <div id="loading" class="loading hidden">
              <p>Behandler bestilling...</p>
            </div>

            <div id="error-message" class="error-message hidden"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.addModalStyles();
  }

  addModalStyles() {
    const styles = `
      <style>
        .order-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .order-modal.hidden {
          display: none;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 0;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .close-modal {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 20px;
        }

        .order-summary {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .order-summary h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .package-details {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          box-sizing: border-box;
        }

        .payment-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .loading {
          text-align: center;
          color: #666;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
        }

        .hidden {
          display: none;
        }

        @media (max-width: 600px) {
          .payment-buttons {
            flex-direction: column;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  attachEventListeners() {
    // Order button listeners
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('order-button')) {
        this.openModal(e.target);
      }
    });

    // Modal close listeners
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('close-modal') || e.target.id === 'order-modal') {
        this.closeModal();
      }
    });

    // Payment button listeners
    document.addEventListener('click', (e) => {
      if (e.target.id === 'pay-with-stripe') {
        this.handleStripePayment();
      } else if (e.target.id === 'request-invoice') {
        this.handleFikenInvoice();
      }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  openModal(button) {
    const packageName = button.dataset.package;
    const price = parseInt(button.dataset.price);

    document.getElementById('selected-package').textContent = packageName;
    document.getElementById('selected-price').textContent = `kr ${price.toLocaleString()}`;
    
    document.getElementById('order-modal').classList.remove('hidden');
    
    // Store current order data
    this.currentOrder = { packageName, price };
  }

  closeModal() {
    document.getElementById('order-modal').classList.add('hidden');
    this.resetForm();
  }

  resetForm() {
    document.getElementById('customer-form').reset();
    document.getElementById('error-message').classList.add('hidden');
    document.getElementById('loading').classList.add('hidden');
  }

  getCustomerDetails() {
    const form = document.getElementById('customer-form');
    const formData = new FormData(form);
    
    return {
      fullName: formData.get('fullName'),
      company: formData.get('company'),
      orgNumber: formData.get('orgNumber'),
      email: formData.get('email'),
    };
  }

  validateForm() {
    const customerDetails = this.getCustomerDetails();
    
    if (!customerDetails.fullName || !customerDetails.email) {
      this.showError('Vennligst fyll ut alle obligatoriske felt.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email)) {
      this.showError('Vennligst oppgi en gyldig e-postadresse.');
      return false;
    }

    return true;
  }

  showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  }

  showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('error-message').classList.add('hidden');
  }

  hideLoading() {
    document.getElementById('loading').classList.add('hidden');
  }

  async handleStripePayment() {
    if (!this.validateForm()) return;

    this.showLoading();

    try {
      const customerDetails = this.getCustomerDetails();
      
      const response = await fetch(`${this.apiBaseUrl}/create-stripe-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageName: this.currentOrder.packageName,
          price: this.currentOrder.price,
          customerDetails,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No payment URL received');
      }

    } catch (error) {
      console.error('Stripe payment error:', error);
      this.hideLoading();
      this.showError('Det oppstod en feil ved opprettelse av betaling. Vennligst prøv igjen.');
    }
  }

  async handleFikenInvoice() {
    if (!this.validateForm()) return;

    this.showLoading();

    try {
      const customerDetails = this.getCustomerDetails();
      
      const response = await fetch(`${this.apiBaseUrl}/create-fiken-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageName: this.currentOrder.packageName,
          price: this.currentOrder.price,
          customerDetails,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Faktura opprettet! Du vil motta faktura på e-post innen kort tid.');
        this.closeModal();
      } else {
        throw new Error(data.message || 'Unknown error');
      }

    } catch (error) {
      console.error('Fiken invoice error:', error);
      this.hideLoading();
      this.showError('Det oppstod en feil ved opprettelse av faktura. Vennligst prøv igjen.');
    }
  }
}

// Initialize the order system when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new OrderSystem();
});