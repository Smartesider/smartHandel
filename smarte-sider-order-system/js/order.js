document.addEventListener('DOMContentLoaded', () => {
    const orderButtons = document.querySelectorAll('.order-button');
    const modal = document.getElementById('order-modal');
    const closeModalButton = document.getElementById('close-modal');
    const payWithStripeButton = document.getElementById('pay-with-stripe');
    const requestInvoiceButton = document.getElementById('request-invoice');
    const customerNameInput = document.getElementById('customer-name');
    const companyNameInput = document.getElementById('company-name');
    const organizationNumberInput = document.getElementById('organization-number');
    const emailInput = document.getElementById('email');
    let selectedPackage = '';
    let selectedPrice = '';

    orderButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedPackage = button.getAttribute('data-package');
            selectedPrice = button.getAttribute('data-price');
            document.getElementById('modal-title').innerText = 'Fullfør din bestilling';
            document.getElementById('package-summary').innerText = `Pakke: ${selectedPackage}, Pris: ${selectedPrice}`;
            modal.style.display = 'block';
        });
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    payWithStripeButton.addEventListener('click', handleStripePayment);
    requestInvoiceButton.addEventListener('click', handleFikenInvoice);

    async function handleStripePayment() {
        const customerDetails = {
            name: customerNameInput.value,
            company: companyNameInput.value,
            organizationNumber: organizationNumberInput.value,
            email: emailInput.value,
            package: selectedPackage,
            price: selectedPrice
        };

        const response = await fetch('https://your-project.vercel.app/api/create-stripe-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerDetails)
        });

        if (response.ok) {
            const { url } = await response.json();
            window.location.href = url;
        } else {
            alert('Error creating Stripe session. Please try again.');
        }
    }

    async function handleFikenInvoice() {
        const customerDetails = {
            name: customerNameInput.value,
            company: companyNameInput.value,
            organizationNumber: organizationNumberInput.value,
            email: emailInput.value,
            package: selectedPackage,
            price: selectedPrice
        };

        const response = await fetch('https://your-project.vercel.app/api/create-fiken-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerDetails)
        });

        if (response.ok) {
            const message = await response.json();
            alert(message);
            modal.style.display = 'none';
        } else {
            alert('Error creating invoice. Please try again.');
        }
    }
});