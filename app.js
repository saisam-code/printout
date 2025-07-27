// Application configuration
const CONFIG = {
    whatsappNumber: '9676043817',
    basePricePerPage: 3,
    spiralBindingPriceLow: 10,
    spiralBindingPriceHigh: 20,
    spiralBindingThreshold: 50,
    urgentDeliveryPrice: 2,
    googleScriptUrl: 'YOUR_GOOGLE_SCRIPT_URL',
    whatsappMessage: 'Hi, I\'ve submitted my order. My file will be sent on WhatsApp.'
};

// Global variables for DOM elements
let isInitialized = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing app');
    initializeApp();
});

function initializeApp() {
    if (isInitialized) return;
    
    try {
        initializeEventListeners();
        calculateTotal(); // Initial calculation
        setupFormValidation();
        isInitialized = true;
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        // Retry after a short delay
        setTimeout(initializeApp, 500);
    }
}

// Event Listeners Setup
function initializeEventListeners() {
    // Get form elements
    const form = document.getElementById('orderForm');
    const pagesInput = document.getElementById('pages');
    const spiralBindingCheckbox = document.getElementById('spiralBinding');
    const urgentDeliveryCheckbox = document.getElementById('urgentDelivery');
    const submitBtn = document.getElementById('submitBtn');
    const fileUpload = document.getElementById('fileUpload');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const retryBtn = document.getElementById('retryBtn');

    // Validation elements
    const nameInput = document.getElementById('name');
    const whatsappInput = document.getElementById('whatsapp');
    const addressInput = document.getElementById('address');

    if (!form || !pagesInput || !spiralBindingCheckbox || !urgentDeliveryCheckbox) {
        console.error('Required form elements not found');
        return;
    }

    console.log('Setting up event listeners');

    // Cost calculation listeners - multiple events to catch all changes
    pagesInput.addEventListener('input', handleCostCalculation);
    pagesInput.addEventListener('change', handleCostCalculation);
    pagesInput.addEventListener('keyup', handleCostCalculation);
    spiralBindingCheckbox.addEventListener('change', handleCostCalculation);
    urgentDeliveryCheckbox.addEventListener('change', handleCostCalculation);
    
    // File upload listener
    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Modal button listeners
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', redirectToWhatsApp);
    }
    if (retryBtn) {
        retryBtn.addEventListener('click', closeErrorModal);
    }
    
    // Validation listeners
    if (nameInput) {
        nameInput.addEventListener('blur', validateName);
        nameInput.addEventListener('input', clearValidationOnInput);
    }
    if (whatsappInput) {
        whatsappInput.addEventListener('blur', validateWhatsApp);
        whatsappInput.addEventListener('input', clearValidationOnInput);
    }
    if (addressInput) {
        addressInput.addEventListener('change', validateAddress);
    }
    if (pagesInput) {
        pagesInput.addEventListener('blur', validatePages);
        pagesInput.addEventListener('input', clearValidationOnInput);
    }

    console.log('Event listeners set up successfully');
}

// Wrapper function for cost calculation with debugging
function handleCostCalculation() {
    console.log('Cost calculation triggered');
    calculateTotal();
}

// Cost Calculation Function
function calculateTotal() {
    console.log('calculateTotal called');
    
    const pagesInput = document.getElementById('pages');
    const spiralBindingCheckbox = document.getElementById('spiralBinding');
    const urgentDeliveryCheckbox = document.getElementById('urgentDelivery');
    
    // Cost display elements
    const pagesCountSpan = document.getElementById('pagesCount');
    const pagesCostSpan = document.getElementById('pagesCost');
    const spiralCostSpan = document.getElementById('spiralCost');
    const urgentCostSpan = document.getElementById('urgentCost');
    const totalCostSpan = document.getElementById('totalCost');
    const spiralCostItem = document.getElementById('spiralCostItem');
    const urgentCostItem = document.getElementById('urgentCostItem');

    if (!pagesInput || !spiralBindingCheckbox || !urgentDeliveryCheckbox) {
        console.error('Required input elements not found for calculation');
        return;
    }

    if (!pagesCountSpan || !pagesCostSpan || !totalCostSpan) {
        console.error('Required display elements not found for calculation');
        return;
    }

    const pages = parseInt(pagesInput.value) || 0;
    const isSpiral = spiralBindingCheckbox.checked;
    const isUrgent = urgentDeliveryCheckbox.checked;
    
    console.log('Calculation inputs:', { pages, isSpiral, isUrgent });
    
    // Calculate base cost (pages × ₹3)
    const pagesCost = pages * CONFIG.basePricePerPage;
    
    // Calculate spiral binding cost
    let spiralCost = 0;
    if (isSpiral && pages > 0) {
        spiralCost = pages <= CONFIG.spiralBindingThreshold ? 
            CONFIG.spiralBindingPriceLow : CONFIG.spiralBindingPriceHigh;
    }
    
    // Calculate urgent delivery cost
    const urgentCost = isUrgent ? CONFIG.urgentDeliveryPrice : 0;
    
    // Calculate total
    const total = pagesCost + spiralCost + urgentCost;
    
    console.log('Calculated costs:', { pagesCost, spiralCost, urgentCost, total });
    
    // Update UI
    updateCostDisplay(pages, pagesCost, spiralCost, urgentCost, total);
}

// Update Cost Display
function updateCostDisplay(pages, pagesCost, spiralCost, urgentCost, total) {
    console.log('updateCostDisplay called with:', { pages, pagesCost, spiralCost, urgentCost, total });
    
    const pagesCountSpan = document.getElementById('pagesCount');
    const pagesCostSpan = document.getElementById('pagesCost');
    const spiralCostSpan = document.getElementById('spiralCost');
    const urgentCostSpan = document.getElementById('urgentCost');
    const totalCostSpan = document.getElementById('totalCost');
    const spiralCostItem = document.getElementById('spiralCostItem');
    const urgentCostItem = document.getElementById('urgentCostItem');
    const spiralBindingCheckbox = document.getElementById('spiralBinding');
    const urgentDeliveryCheckbox = document.getElementById('urgentDelivery');

    // Update pages count and cost
    if (pagesCountSpan) {
        pagesCountSpan.textContent = pages;
        console.log('Updated pages count to:', pages);
    }
    if (pagesCostSpan) {
        pagesCostSpan.textContent = pagesCost;
        console.log('Updated pages cost to:', pagesCost);
    }
    
    // Update spiral binding display
    if (spiralBindingCheckbox && spiralBindingCheckbox.checked && pages > 0) {
        if (spiralCostSpan) {
            spiralCostSpan.textContent = spiralCost;
        }
        if (spiralCostItem) {
            spiralCostItem.style.display = 'flex';
            animateCostItem(spiralCostItem);
        }
        console.log('Spiral binding cost displayed:', spiralCost);
    } else {
        if (spiralCostItem) {
            spiralCostItem.style.display = 'none';
        }
        console.log('Spiral binding cost hidden');
    }
    
    // Update urgent delivery display
    if (urgentDeliveryCheckbox && urgentDeliveryCheckbox.checked) {
        if (urgentCostItem) {
            urgentCostItem.style.display = 'flex';
            animateCostItem(urgentCostItem);
        }
        console.log('Urgent delivery cost displayed:', urgentCost);
    } else {
        if (urgentCostItem) {
            urgentCostItem.style.display = 'none';
        }
        console.log('Urgent delivery cost hidden');
    }
    
    // Update total
    if (totalCostSpan) {
        totalCostSpan.textContent = total;
        console.log('Updated total cost to:', total);
    }
}

// Animate cost item for visual feedback
function animateCostItem(element) {
    if (element) {
        element.classList.add('animate');
        setTimeout(() => {
            element.classList.remove('animate');
        }, 300);
    }
}

// File Upload Handler
function handleFileUpload() {
    const fileUpload = document.getElementById('fileUpload');
    const fileInfo = document.getElementById('fileInfo');
    const fileLinkInput = document.getElementById('fileLink');

    if (!fileUpload || !fileInfo) return;
    
    const file = fileUpload.files[0];
    if (file) {
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        fileInfo.innerHTML = `
            <strong>Selected:</strong> ${file.name} (${fileSize} MB)
            <br><small>File will be processed after form submission</small>
        `;
        fileInfo.style.color = '#4CAF50';
        
        if (fileLinkInput) fileLinkInput.value = '';
    } else {
        fileInfo.innerHTML = '';
    }
}

// Form Validation Functions
function validateName() {
    const nameInput = document.getElementById('name');
    if (!nameInput) return true;
    
    const name = nameInput.value.trim();
    if (name.length < 2) {
        showFieldError(nameInput, 'nameError', 'Name must be at least 2 characters long');
        return false;
    }
    clearFieldError(nameInput, 'nameError');
    return true;
}

function validateWhatsApp() {
    const whatsappInput = document.getElementById('whatsapp');
    if (!whatsappInput) return true;
    
    const whatsapp = whatsappInput.value.trim();
    const pattern = /^[6-9][0-9]{9}$/;
    if (!whatsapp) {
        showFieldError(whatsappInput, 'whatsappError', 'WhatsApp number is required');
        return false;
    }
    if (!pattern.test(whatsapp)) {
        showFieldError(whatsappInput, 'whatsappError', 'Please enter a valid 10-digit mobile number starting with 6-9');
        return false;
    }
    clearFieldError(whatsappInput, 'whatsappError');
    return true;
}

function validateAddress() {
    const addressInput = document.getElementById('address');
    if (!addressInput) return true;
    
    if (!addressInput.value) {
        showFieldError(addressInput, 'addressError', 'Please select a delivery address');
        return false;
    }
    clearFieldError(addressInput, 'addressError');
    return true;
}

function validatePages() {
    const pagesInput = document.getElementById('pages');
    if (!pagesInput) return true;
    
    const pages = parseInt(pagesInput.value);
    if (!pages || pages < 1 || pages > 1000) {
        showFieldError(pagesInput, 'pagesError', 'Please enter a valid number of pages (1-1000)');
        return false;
    }
    clearFieldError(pagesInput, 'pagesError');
    return true;
}

function validateFileInput() {
    const fileUpload = document.getElementById('fileUpload');
    const fileLinkInput = document.getElementById('fileLink');
    
    if (!fileUpload || !fileLinkInput) return true;
    
    const hasFile = fileUpload.files.length > 0;
    const hasLink = fileLinkInput.value.trim().length > 0;
    
    if (!hasFile && !hasLink) {
        alert('Please either upload a file or provide a Google Drive link');
        return false;
    }
    return true;
}

// Validation Helper Functions
function showFieldError(field, errorId, message) {
    if (!field) return;
    
    field.classList.add('error');
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFieldError(field, errorId) {
    if (!field) return;
    
    field.classList.remove('error');
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function clearValidationOnInput(event) {
    const field = event.target;
    if (field) {
        field.classList.remove('error');
        const fieldId = field.id;
        const errorElement = document.getElementById(fieldId + 'Error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}

// Form Validation Setup
function setupFormValidation() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    requiredFields.forEach(field => {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label && !label.textContent.includes('*')) {
            label.innerHTML = label.innerHTML.replace(' *', '') + ' *';
        }
    });
}

// Form Submission Handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    console.log('Form submission started');
    
    // Validate all fields
    const isNameValid = validateName();
    const isWhatsAppValid = validateWhatsApp();
    const isAddressValid = validateAddress();
    const isPagesValid = validatePages();
    const isFileValid = validateFileInput();
    
    console.log('Validation results:', {
        name: isNameValid,
        whatsapp: isWhatsAppValid,
        address: isAddressValid,
        pages: isPagesValid,
        file: isFileValid
    });
    
    if (!isNameValid || !isWhatsAppValid || !isAddressValid || !isPagesValid || !isFileValid) {
        console.log('Form validation failed');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Prepare form data
        const formData = collectFormData();
        console.log('Form data collected:', formData);
        
        // Submit to Google Apps Script
        const response = await submitToGoogleScript(formData);
        console.log('Submission response:', response);
        
        if (response.success) {
            showSuccessModal();
        } else {
            throw new Error(response.message || 'Submission failed');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showErrorModal(error.message);
    } finally {
        setLoadingState(false);
    }
}

// Collect Form Data
function collectFormData() {
    const nameInput = document.getElementById('name');
    const whatsappInput = document.getElementById('whatsapp');
    const addressInput = document.getElementById('address');
    const pagesInput = document.getElementById('pages');
    const spiralBindingCheckbox = document.getElementById('spiralBinding');
    const urgentDeliveryCheckbox = document.getElementById('urgentDelivery');
    const fileLinkInput = document.getElementById('fileLink');
    const fileUpload = document.getElementById('fileUpload');
    const accessories = document.getElementById('accessories');
    const orderType = document.querySelector('input[name="orderType"]:checked');
    
    const formData = {
        name: nameInput ? nameInput.value.trim() : '',
        whatsapp: whatsappInput ? whatsappInput.value.trim() : '',
        address: addressInput ? addressInput.value : '',
        pages: pagesInput ? pagesInput.value : '',
        orderType: orderType ? orderType.value : '',
        spiralBinding: spiralBindingCheckbox ? spiralBindingCheckbox.checked : false,
        urgentDelivery: urgentDeliveryCheckbox ? urgentDeliveryCheckbox.checked : false,
        accessories: accessories ? accessories.value.trim() : '',
        fileLink: fileLinkInput ? fileLinkInput.value.trim() : '',
        timestamp: new Date().toISOString()
    };
    
    // Add file info
    if (fileUpload && fileUpload.files.length > 0) {
        formData.fileName = fileUpload.files[0].name;
        formData.fileSize = fileUpload.files[0].size;
        formData.fileSource = 'upload';
    } else if (fileLinkInput && fileLinkInput.value.trim()) {
        formData.fileSource = 'link';
    }
    
    // Calculate costs
    const pages = parseInt(pagesInput ? pagesInput.value : 0) || 0;
    const spiralCost = (spiralBindingCheckbox && spiralBindingCheckbox.checked && pages > 0) ? 
        (pages <= CONFIG.spiralBindingThreshold ? CONFIG.spiralBindingPriceLow : CONFIG.spiralBindingPriceHigh) : 0;
    const urgentCost = (urgentDeliveryCheckbox && urgentDeliveryCheckbox.checked) ? CONFIG.urgentDeliveryPrice : 0;
    const total = (pages * CONFIG.basePricePerPage) + spiralCost + urgentCost;
    
    formData.totalCost = total;
    
    return formData;
}

// Submit to Google Apps Script
async function submitToGoogleScript(formData) {
    const url = CONFIG.googleScriptUrl;
    
    // For demo purposes, simulate successful submission
    if (url === 'https://script.google.com/macros/s/AKfycbyn3KULtc3GwFYN_psa9KFixT_OcJfB2ZlHH2JzqiCs6HgG3pczMi3mafV4M6XiEfey/exec') {
        console.log('Demo mode: simulating submission');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, 2000);
        });
    }
    
    // Real submission to Google Apps Script
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Loading State Management
function setLoadingState(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    
    if (!submitBtn || !btnText || !btnLoading) return;
    
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// Modal Functions
function showSuccessModal() {
    const successModal = document.getElementById('successMessage');
    if (successModal) {
        successModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function showErrorModal(message) {
    const errorModal = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    if (errorModal && errorText) {
        errorText.textContent = message || 'Something went wrong. Please try again.';
        errorModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeErrorModal() {
    const errorModal = document.getElementById('errorMessage');
    if (errorModal) {
        errorModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

function closeSuccessModal() {
    const successModal = document.getElementById('successMessage');
    if (successModal) {
        successModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// WhatsApp Redirect
function redirectToWhatsApp() {
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
    closeSuccessModal();
    
    // Optional: Reset form after successful submission
    setTimeout(() => {
        if (confirm('Would you like to place another order?')) {
            resetForm();
        }
    }, 1000);
}

// Reset Form
function resetForm() {
    const form = document.getElementById('orderForm');
    const fileInfo = document.getElementById('fileInfo');
    
    if (form) {
        form.reset();
    }
    if (fileInfo) {
        fileInfo.innerHTML = '';
    }
    calculateTotal();
    
    // Clear all validation states
    const errorFields = document.querySelectorAll('.form-control.error');
    const errorMessages = document.querySelectorAll('.error-message');
    
    errorFields.forEach(field => field.classList.remove('error'));
    errorMessages.forEach(msg => msg.style.display = 'none');
}

// Debugging function - can be called from console
window.debugCalculator = function() {
    console.log('=== Calculator Debug Info ===');
    const pagesInput = document.getElementById('pages');
    const spiralCheckbox = document.getElementById('spiralBinding');
    const urgentCheckbox = document.getElementById('urgentDelivery');
    
    console.log('Pages input value:', pagesInput ? pagesInput.value : 'NOT FOUND');
    console.log('Spiral checkbox checked:', spiralCheckbox ? spiralCheckbox.checked : 'NOT FOUND');
    console.log('Urgent checkbox checked:', urgentCheckbox ? urgentCheckbox.checked : 'NOT FOUND');
    
    const pagesCount = document.getElementById('pagesCount');
    const pagesCost = document.getElementById('pagesCost');
    const totalCost = document.getElementById('totalCost');
    
    console.log('Pages count display:', pagesCount ? pagesCount.textContent : 'NOT FOUND');
    console.log('Pages cost display:', pagesCost ? pagesCost.textContent : 'NOT FOUND');
    console.log('Total cost display:', totalCost ? totalCost.textContent : 'NOT FOUND');
    
    console.log('Is app initialized:', isInitialized);
    console.log('=== End Debug Info ===');
    
    // Trigger calculation manually
    calculateTotal();
};

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateTotal,
        validateName,
        validateWhatsApp,
        validatePages,
        CONFIG
    };
}
