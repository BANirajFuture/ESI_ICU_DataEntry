from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from supabase import create_client
from config import Config
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Initialize Supabase client
supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

@app.route('/')
def index():
    """Serve the main HTML file"""
    with open('frontend/index.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/api/patients', methods=['GET'])
def get_patients():
    """Get all patients from the database"""
    try:
        response = supabase.table('icu_patients').select('*').order('created_at', desc=True).execute()
        return jsonify({
            'success': True,
            'data': response.data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/patients', methods=['POST'])
def add_patient():
    """Add a new patient to the database"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['bed_number', 'patient_name', 'admission_date', 'status', 'life_support', 'age', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400

        # Add timestamp
        data['last_updated'] = datetime.now().isoformat()
        
        response = supabase.table('icu_patients').insert(data).execute()
        
        return jsonify({
            'success': True,
            'data': response.data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/patients/<patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    """Delete a patient from the database"""
    try:
        response = supabase.table('icu_patients').delete().eq('id', patient_id).execute()
        
        return jsonify({
            'success': True,
            'message': 'Patient deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/patients/<patient_id>', methods=['PUT'])
def update_patient(patient_id):
    """Update a patient's information"""
    try:
        data = request.json
        data['last_updated'] = datetime.now().isoformat()
        
        response = supabase.table('icu_patients').update(data).eq('id', patient_id).execute()
        
        return jsonify({
            'success': True,
            'data': response.data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Simple login endpoint"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Simple hardcoded authentication (replace with proper auth)
    if username == 'admin' and password == 'esi2024':
        return jsonify({
            'success': True,
            'message': 'Login successful'
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Invalid credentials'
        }), 401

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
