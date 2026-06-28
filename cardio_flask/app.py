import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from dotenv import load_dotenv
load_dotenv()  # loads .env file into os.getenv()

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS  # Allows frontend (React/HTML) to talk with backend
import numpy as np
import pandas as pd
import joblib  # ML models loading 
import tensorflow as tf
from PIL import Image # smooth image processing
from reportlab.pdfgen import canvas # PDF generation
from reportlab.lib.pagesizes import letter
from datetime import datetime

from database import db, init_db
from models import Patient
from admin import admin_bp

app = Flask(__name__)   # Flask():-creates a web server
CORS(app)  # this says allow requests form other domains(frontend)

# -------------------------
# PostgreSQL Configuration
# -------------------------

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}".format(
        user     = os.getenv("DB_USER",     "postgres"),
        password = os.getenv("DB_PASSWORD", "root"),
        host     = os.getenv("DB_HOST",     "localhost"),
        port     = os.getenv("DB_PORT",     "5432"),
        db       = os.getenv("DB_NAME",     "cardio_ai"),
    )
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

init_db(app)  # database initialization
app.register_blueprint(admin_bp)  # It adds extra routes from another file like (admin.py)

# -------------------------
# Load Models Safely
# -------------------------
# if there is an error in model loading app wouldn't crash.
try:
    stage1_model = joblib.load("77%_recall_rf_et_xgb_stacking_model.pkl")
except Exception as e:
    print("Error loading Stage1 model:", e)
    stage1_model = None

try:
    stage2_model = tf.keras.models.load_model(
        "CardiacCADMRI_Xception_Model.keras",
        compile=False
    )
except Exception as e:
    print("Error loading Stage2 model:", e)
    stage2_model = None


# -------------------------
# Global storage
# -------------------------

"""Your app has multiple APIs (routes):

    1./predict_clinical
    2./predict_mri
    3./download_report
    But HTTP requests are separate calls
    
    So you needed a way to share data between them

    ➡️ That’s why you used global variables"""


last_stage1   = None  # Stores clinical model prediction result
last_stage2   = None
patient_data  = {}  # for staring patient data
current_patient_id = None   # DB row ID of the active patient session

"""
👉 Why needed?

Flow:

1.Clinical API → creates patient in DB
2.MRI API → updates SAME patient

"""
# -------------------------
# Conversion Functions
# -------------------------

def convert_cholesterol(mgdl):
    if mgdl < 200:
        return 1, "Normal"
    elif mgdl < 240:
        return 2, "Above Normal"
    else:
        return 3, "Well Above Normal"


def convert_glucose(mgdl):
    if mgdl < 100:
        return 1, "Normal"
    elif mgdl < 126:
        return 2, "Above Normal"
    else:
        return 3, "Well Above Normal"


# -------------------------
# Validate JSON fields :-It checks whether all required inputs are present in the user request before sending data to the ML model.
# -------------------------

def validate_json(data, fields):   # data → input from frontend (JSON) , fields → list of required fields
    for field in fields:   # It checks each required field one by one
        if field not in data:
            return False, f"Missing field: {field}"
    return True, None


# -------------------------
# Clinical Prediction API
# -------------------------
                                                   # “This endpoint is used to send patient clinical data for prediction.”
@app.route("/predict_clinical", methods=["POST"])  # (API route): This API runs when frontend calls
def predict_clinical(): # Allows this function to use and update global variables

    global last_stage1, patient_data, current_patient_id

    try:

        if stage1_model is None:
            return jsonify({"error": "Clinical model not loaded"}), 500

        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body must be JSON"}), 400

        required_fields = [
            "name",
            "age", "gender", "height", "weight",
            "ap_hi", "ap_lo", "cholesterol", "gluc",
            "smoke", "alco", "active"
        ]

        valid, message = validate_json(data, required_fields)
        if not valid:
            return jsonify({"error": message}), 400

        # -------------------------
        # Input Values
        # -------------------------
        
        name   = str(data["name"]).strip()
        age    = float(data["age"])
        gender = int(data["gender"])

        height = float(data["height"])
        weight = float(data["weight"])

        ap_hi  = float(data["ap_hi"])
        ap_lo  = float(data["ap_lo"])

        cholesterol_input = float(data["cholesterol"])
        gluc_input        = float(data["gluc"])

        smoke  = int(data["smoke"])
        alco   = int(data["alco"])
        active = int(data["active"])
        
        # -------------------------
        # Convert mg/dL → category
        # -------------------------

        cholesterol, chol_category = convert_cholesterol(cholesterol_input)
        gluc, gluc_category        = convert_glucose(gluc_input)

        # -------------------------
        # Feature Engineering
        # -------------------------

        bmi            = weight / ((height / 100) ** 2)
        pulse_pressure = ap_hi - ap_lo
        health_index   = (active * 1.0) - (smoke * 0.5) - (alco * 0.5)
        chol_gluc_interaction = cholesterol * gluc
        
        columns = [
            "gender", "weight", "ap_hi", "ap_lo",
            "cholesterol", "gluc", "smoke", "alco",
            "active", "age_years", "bmi",
            "pulse_pressure", "health_index",
            "chol_gluc_interaction"
        ]
        # Converts input into format required by ML model
        features_df = pd.DataFrame([[
            gender, weight, ap_hi, ap_lo,
            cholesterol, gluc, smoke, alco,
            active, age, bmi,
            pulse_pressure, health_index, chol_gluc_interaction
        ]], columns=columns)

        prob   = float(stage1_model.predict_proba(features_df)[0][1])  # predicts probability of having desease.
        result = prob

        last_stage1 = result
        print(data)
        patient_data = {
            "name":   name,
            "age":    age,
            "gender": "Woman" if gender == 1 else "Man",
            "weight": weight,
            "height": height,
            "bmi":    round(bmi, 2),
            "bp":     f"{ap_hi}/{ap_lo}",
            "cholesterol": f"{cholesterol_input} mg/dL ({chol_category})",
            "glucose":     f"{gluc_input} mg/dL ({gluc_category})",
            "stage1":      result,
        }

        # -------------------------
        # Save / update DB record
        # -------------------------

        patient = Patient(
            name          = name,
            age           = age,
            gender        = "Woman" if gender == 1 else "Man",
            height        = height,
            weight        = weight,
            bmi           = round(bmi, 2),
            ap_hi         = ap_hi,
            ap_lo         = ap_lo,
            cholesterol   = cholesterol_input,
            glucose       = gluc_input,
            chol_category = chol_category,
            gluc_category = gluc_category,
            smoke         = bool(smoke),
            alco          = bool(alco),
            active        = bool(active),
            stage1_risk   = result,
            stage2_risk   = None,
            high_risk     = prob >= 0.40,
        )

        db.session.add(patient)
        db.session.commit()
        current_patient_id = patient.id  # Tracks this patient for next API

        

        return jsonify({
            "patient_id":           patient.id,
            "risk_probability":     result,
            "high_risk":            prob >= 0.40,
            "cholesterol_category": chol_category,
            "glucose_category":     gluc_category,
            "bmi":                  round(bmi, 2),
            "pulse_pressure":       pulse_pressure,
            "health_index":         health_index,
            "chol_gluc_interaction": chol_gluc_interaction,
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# MRI Prediction API
# -------------------------

@app.route("/predict_mri", methods=["POST"])
def predict_mri():

    global current_patient_id

    try:

        if stage2_model is None:
            return jsonify({"error": "MRI model not loaded"}), 500

        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        if last_stage1 is None:
            return jsonify({"error": "Clinical prediction required first"}), 400

        file  = request.files["image"] # 1. Get Image
        image = Image.open(file).convert("RGB").resize((299, 299))   # 2. Preprocess Image
        img   = np.expand_dims(np.array(image) / 255.0, axis=0)   # 3. Normalize

        prediction = float(stage2_model.predict(img, verbose=0)[0][0])   # 4. Predict
        result     = round(prediction, 3)

        last_stage2 = result  # kept for backward compat if frontend reads it
        patient_data["stage2"] = result

        # -------------------------
        # Update the existing DB row
        # -------------------------

        if current_patient_id:
            patient = db.session.get(Patient, current_patient_id)
            if patient:
                patient.stage2_risk = result
                # Re-evaluate overall high_risk with MRI score included
                patient.high_risk = (patient.stage1_risk >= 0.40) or (result >= 0.50)
                db.session.commit()

        return jsonify({
            "patient_id":      current_patient_id,
            "mri_probability": result,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# Download Report
# -------------------------

@app.route("/download_report")   # Download Report API
def download_report():

    try:

        if not patient_data:
            return jsonify({"error": "No patient data available"}), 400

        filename = f"cardio_ai_report_{datetime.now().timestamp()}.pdf"

        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter

        c.setFont("Helvetica-Bold", 18)
        c.drawString(140, height - 80, "Cardiovascular AI Diagnostic Report")

        c.setFont("Helvetica", 10)
        c.drawString(420, height - 100, datetime.now().strftime("%Y-%m-%d %H:%M"))

        c.setFont("Helvetica", 12)
        c.drawString(120, height - 160, f"Name: {patient_data.get('name', '-')}")
        c.drawString(120, height - 180, f"Age: {patient_data.get('age', '-')}")
        c.drawString(120, height - 200, f"Gender: {patient_data.get('gender', '-')}")
        c.drawString(120, height - 220, f"Weight: {patient_data.get('weight', '-')} kg")
        c.drawString(120, height - 240, f"Height: {patient_data.get('height', '-')} cm")
        c.drawString(120, height - 260, f"BMI: {patient_data.get('bmi', '-')}")
        c.drawString(120, height - 280, f"Blood Pressure: {patient_data.get('bp', '-')}")
        c.drawString(120, height - 300, f"Cholesterol: {patient_data.get('cholesterol', '-')}")
        c.drawString(120, height - 320, f"Glucose: {patient_data.get('glucose', '-')}")
        c.drawString(120, height - 360, f"Stage1 Risk: {patient_data.get('stage1', '-')}")
        c.drawString(120, height - 380, f"MRI Probability: {patient_data.get('stage2', '-')}")

        c.save()

        return send_file(filename, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# Health Check
# -------------------------

@app.route("/")
def home():
    return jsonify({"message": "Cardiovascular AI API Running"})


# -------------------------
# Run App
# -------------------------

if __name__ == "__main__":   # Starts Flask server
    app.run(debug=True)