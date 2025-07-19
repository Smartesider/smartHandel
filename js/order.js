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
                <span id="selected-price-display">kr 9,990</span>
              </div>
            </div>

            <!-- Price Overview Section -->
            <div class="price-overview">
              <h4>Prisoversikt</h4>
              <div class="price-row">
                <span>Pris (eks. mva):</span>
                <span id="pris-eks-mva">0,-</span>
              </div>
              <div class="price-row">
                <span>MVA (25%):</span>
                <span id="mva-belop">0,-</span>
              </div>
              <div class="price-row total-row">
                <span>Total (inkl. mva):</span>
                <span id="total-pris">0,-</span>
              </div>
            </div>

            <form id="customer-form">
              <!-- Contact Person -->
              <div class="form-group">
                <label for="kontaktperson">Kontaktperson *</label>
                <input type="text" id="kontaktperson" name="kontaktperson" required>
              </div>

              <!-- Phone -->
              <div class="form-group">
                <label for="telefon">Telefon *</label>
                <input type="tel" id="telefon" name="telefon" required>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label for="epost">E-post *</label>
                <input type="email" id="epost" name="epost" required>
              </div>

              <!-- Company Name -->
              <div class="form-group">
                <label for="firmanavn">Firmanavn *</label>
                <input type="text" id="firmanavn" name="firmanavn" required>
              </div>

              <!-- Organization Number -->
              <div class="form-group">
                <label for="orgnummer">Organisasjonsnummer *</label>
                <input type="text" id="orgnummer" name="orgnummer" required pattern="[0-9]{9}" placeholder="123456789">
              </div>

              <!-- Address -->
              <div class="form-group">
                <label for="adresse">Adresse *</label>
                <input type="text" id="adresse" name="adresse" required>
              </div>

              <!-- Postal Code -->
              <div class="form-group">
                <label for="postnr">Postnr *</label>
                <input type="text" id="postnr" name="postnr" required pattern="[0-9]{4}" placeholder="0123">
              </div>

              <!-- City -->
              <div class="form-group">
                <label for="poststed">Poststed *</label>
                <input type="text" id="poststed" name="poststed" required>
              </div>

              <!-- Comment -->
              <div class="form-group">
                <label for="kommentar">Kommentar</label>
                <textarea id="kommentar" name="kommentar" rows="3" placeholder="Eventuelle spesielle ønsker eller kommentarer..."></textarea>
              </div>
            </form>

            <div class="payment-buttons">
              <button id="pay-with-stripe" class="btn btn-primary">
                <span class="btn-icon">💳</span>
                Betal med kort
              </button>
              <button id="request-invoice" class="btn btn-secondary">
                <span class="btn-icon">📄</span>
                Send faktura
              </button>
            </div>

            <div id="loading" class="loading hidden">
              <div class="spinner"></div>
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
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .order-modal.hidden {
          display: none;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 0;
          max-width: 600px;
          width: 95%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 30px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .close-modal {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s;
        }

        .close-modal:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-body {
          padding: 30px;
        }

        .order-summary {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          border: 1px solid #cbd5e0;
        }

        .order-summary h3 {
          margin: 0 0 15px 0;
          color: #2d3748;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .package-details {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          color: #4a5568;
        }

        .price-overview {
          background: #f7fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }

        .price-overview h4 {
          margin: 0 0 15px 0;
          color: #2d3748;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #4a5568;
        }

        .price-row.total-row {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #cbd5e0;
          font-weight: 700;
          font-size: 1.1rem;
          color: #2d3748;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2d3748;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
          transition: border-color 0.3s, box-shadow 0.3s;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .payment-buttons {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }

        .btn {
          flex: 1;
          padding: 16px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 56px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #718096 0%, #4a5568 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(113, 128, 150, 0.4);
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(113, 128, 150, 0.6);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-icon {
          font-size: 18px;
        }

        .loading {
          text-align: center;
          color: #718096;
          padding: 20px;
        }

        .spinner {
          border: 3px solid #e2e8f0;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background: #fed7d7;
          color: #9b2c2c;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
          border: 1px solid #feb2b2;
          font-weight: 500;
        }

        .hidden {
          display: none;
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 98%;
            margin: 10px;
          }

          .modal-body {
            padding: 20px;
          }

          .payment-buttons {
            flex-direction: column;
          }

          .modal-header {
            padding: 20px;
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
      if (e.target.classList.contains('close-modal')) {
        this.closeModal();
      }
      if (e.target.id === 'order-modal') {
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
    const priceExVat = parseInt(button.dataset.price);

    // Calculate VAT and total
    const vatAmount = Math.round(priceExVat * 0.25);
    const totalPrice = priceExVat + vatAmount;

    // Update display
    document.getElementById('selected-package').textContent = packageName;
    document.getElementById('selected-price-display').textContent = `kr ${totalPrice.toLocaleString()}`;
    
    // Update price breakdown
    document.getElementById('pris-eks-mva').textContent = `kr ${priceExVat.toLocaleString()}`;
    document.getElementById('mva-belop').textContent = `kr ${vatAmount.toLocaleString()}`;
    document.getElementById('total-pris').textContent = `kr ${totalPrice.toLocaleString()}`;
    
    document.getElementById('order-modal').classList.remove('hidden');
    
    // Store current order data
    this.currentOrder = { 
      packageName, 
      priceExVat, 
      vatAmount, 
      totalPrice 
    };
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
      contactPerson: formData.get('kontaktperson'),
      phone: formData.get('telefon'),
      email: formData.get('epost'),
      companyName: formData.get('firmanavn'),
      orgNumber: formData.get('orgnummer'),
      address: formData.get('adresse'),
      zipCode: formData.get('postnr'),
      city: formData.get('poststed'),
      comment: formData.get('kommentar') || ''
    };
  }

  validateForm() {
    const customerDetails = this.getCustomerDetails();
    
    // Check required fields
    const requiredFields = [
      { field: 'contactPerson', label: 'Kontaktperson' },
      { field: 'phone', label: 'Telefon' },
      { field: 'email', label: 'E-post' },
      { field: 'companyName', label: 'Firmanavn' },
      { field: 'orgNumber', label: 'Organisasjonsnummer' },
      { field: 'address', label: 'Adresse' },
      { field: 'zipCode', label: 'Postnr' },
      { field: 'city', label: 'Poststed' }
    ];

    for (const { field, label } of requiredFields) {
      if (!customerDetails[field] || customerDetails[field].trim() === '') {
        this.showError(`Vennligst fyll ut: ${label}`);
        return false;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email)) {
      this.showError('Vennligst oppgi en gyldig e-postadresse.');
      return false;
    }

    // Validate organization number (9 digits)
    const orgNumberRegex = /^[0-9]{9}$/;
    if (!orgNumberRegex.test(customerDetails.orgNumber)) {
      this.showError('Organisasjonsnummer må bestå av 9 siffer.');
      return false;
    }

    // Validate postal code (4 digits)
    const zipCodeRegex = /^[0-9]{4}$/;
    if (!zipCodeRegex.test(customerDetails.zipCode)) {
      this.showError('Postnummer må bestå av 4 siffer.');
      return false;
    }

    return true;
  }

  showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('error-message').classList.add('hidden');
    
    // Disable buttons
    document.getElementById('pay-with-stripe').disabled = true;
    document.getElementById('request-invoice').disabled = true;
  }

  hideLoading() {
    document.getElementById('loading').classList.add('hidden');
    
    // Re-enable buttons
    document.getElementById('pay-with-stripe').disabled = false;
    document.getElementById('request-invoice').disabled = false;
  }

  async handleStripePayment() {
    if (!this.validateForm()) return;

    this.showLoading();

    try {
      const customerDetails = this.getCustomerDetails();
      
      const orderData = {
        package: this.currentOrder.packageName,
        priceExVat: this.currentOrder.priceExVat,
        vatAmount: this.currentOrder.vatAmount,
        totalPrice: this.currentOrder.totalPrice,
        customer: customerDetails
      };

      const response = await fetch(`${this.apiBaseUrl}/create-stripe-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create payment session: ${errorText}`);
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
      
      const orderData = {
        package: this.currentOrder.packageName,
        priceExVat: this.currentOrder.priceExVat,
        vatAmount: this.currentOrder.vatAmount,
        totalPrice: this.currentOrder.totalPrice,
        customer: customerDetails
      };

      const response = await fetch(`${this.apiBaseUrl}/create-fiken-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create invoice: ${errorText}`);
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