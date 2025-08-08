// Supabase configuration
const SUPABASE_URL = 'https://xtfomokiryxzpziwndkv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0Zm9tb2tpcnl4enB6aXduZGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODI5MDcsImV4cCI6MjA2OTQ1ODkwN30.9oFI_a_drnsNlWlJwIpe1SVOuIwwj0HSeA0SxuSjq_Q';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Login credentials (should be moved to secure authentication)
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "esi2024";

let currentUser = null;

async function handleLogin() {
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');

    if (usernameInput === VALID_USERNAME && passwordInput === VALID_PASSWORD) {
        currentUser = usernameInput;
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('data-entry-section').classList.remove('hidden');
        loginMessage.classList.add('hidden');
        
        // Load existing data
        await loadPatientData();
    } else {
        loginMessage.textContent = 'Invalid username or password.';
        loginMessage.classList.remove('hidden');
    }
}

document.getElementById('icu-data-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const formData = {
        bed_number: document.getElementById('bedNumber').value,
        patient_name: document.getElementById('patientName').value,
        admission_date: document.getElementById('admissionDate').value,
        status: document.getElementById('status').value,
        life_support: document.getElementById('lifeSupport').value,
        comments: document.getElementById('comments').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        last_updated: new Date().toISOString(),
        created_by: currentUser
    };

    try {
        const { data, error } = await supabase
            .from('icu_patients')
            .insert([formData]);

        if (error) {
            console.error('Error inserting data:', error);
            alert('Error saving data: ' + error.message);
        } else {
            alert('Data saved successfully!');
            this.reset();
            await loadPatientData();
        }
    } catch (err) {
        console.error('Network error:', err);
        alert('Network error occurred. Please try again.');
    }
});

async function loadPatientData() {
    const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '<tr><td colspan="11" class="loading">Loading data...</td></tr>';

    try {
        const { data, error } = await supabase
            .from('icu_patients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching data:', error);
            tableBody.innerHTML = '<tr><td colspan="11" class="error">Error loading data</td></tr>';
            return;
        }

        tableBody.innerHTML = '';

        if (data && data.length > 0) {
            data.forEach(patient => {
                const row = tableBody.insertRow();
                
                const admissionDate = new Date(patient.admission_date);
                const today = new Date();
                const diffTime = Math.abs(today - admissionDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const lastUpdate = new Date(patient.last_updated).toLocaleString();

                row.insertCell().textContent = patient.bed_number;
                row.insertCell().textContent = patient.patient_name;
                row.insertCell().textContent = patient.admission_date;
                row.insertCell().textContent = patient.status;
                row.insertCell().textContent = patient.life_support;
                row.insertCell().textContent = patient.comments || '';
                row.insertCell().textContent = patient.age;
                row.insertCell().textContent = patient.gender;
                row.insertCell().textContent = lastUpdate;
                row.insertCell().textContent = diffDays + " days";
                
                const actionsCell = row.insertCell();
                actionsCell.innerHTML = `
                    <button onclick="deletePatient('${patient.id}')" class="btn-danger" style="padding: 5px 10px; font-size: 12px;">
                        Delete
                    </button>
                `;
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="11" style="text-align: center;">No data found</td></tr>';
        }
    } catch (err) {
        console.error('Network error:', err);
        tableBody.innerHTML = '<tr><td colspan="11" class="error">Network error occurred</td></tr>';
    }
}

async function deletePatient(patientId) {
    if (confirm('Are you sure you want to delete this patient record?')) {
        try {
            const { error } = await supabase
                .from('icu_patients')
                .delete()
                .eq('id', patientId);

            if (error) {
                console.error('Error deleting data:', error);
                alert('Error deleting record: ' + error.message);
            } else {
                alert('Record deleted successfully!');
                await loadPatientData();
            }
        } catch (err) {
            console.error('Network error:', err);
            alert('Network error occurred. Please try again.');
        }
    }
}

function validateForm() {
    let isValid = true;
    const requiredFields = ['bedNumber', 'patientName', 'admissionDate', 'status', 'lifeSupport', 'age', 'gender'];

    requiredFields.forEach(fieldId => {
        const inputElement = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + '-error');
        if (!inputElement.value.trim()) {
            errorElement.textContent = 'This field is required.';
            errorElement.classList.remove('hidden');
            isValid = false;
        } else {
            errorElement.classList.add('hidden');
        }
    });

    const ageInput = document.getElementById('age');
    const ageError = document.getElementById('age-error');
    if (ageInput.value && parseInt(ageInput.value) < 0) {
        ageError.textContent = 'Age cannot be negative.';
        ageError.classList.remove('hidden');
        isValid = false;
    } else if (ageInput.value && !Number.isInteger(parseFloat(ageInput.value))) {
        ageError.textContent = 'Age must be a whole number.';
        ageError.classList.remove('hidden');
        isValid = false;
    }

    return isValid;
}

// Allow Enter key to submit login
document.getElementById('password').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleLogin();
    }
});
