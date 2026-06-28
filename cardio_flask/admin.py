from flask import Blueprint, request, jsonify
from models import Patient

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# -------------------------------------------------------
# Shared helper – build base query (search by name)
# -------------------------------------------------------

def _base_query(name_filter: str | None):
    q = Patient.query
    if name_filter:
        q = q.filter(Patient.name.ilike(f"%{name_filter}%"))
    return q


# -------------------------------------------------------
# GET /admin/patients
#   ?page=1&per_page=10&name=John
# -------------------------------------------------------

@admin_bp.route("/patients", methods=["GET"])
def list_patients():
    try:
        page     = int(request.args.get("page",     1))
        per_page = int(request.args.get("per_page", 10))
        name     = request.args.get("name", "").strip() or None

        # Clamp per_page to a safe range
        per_page = max(1, min(per_page, 100))

        pagination = (
            _base_query(name)
            .order_by(Patient.updated_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        return jsonify({
            "patients":   [p.to_dict() for p in pagination.items],
            "total":      pagination.total,
            "page":       pagination.page,
            "per_page":   pagination.per_page,
            "total_pages": pagination.pages,
            "has_next":   pagination.has_next,
            "has_prev":   pagination.has_prev,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------------
# GET /admin/patients/<id>
# -------------------------------------------------------

@admin_bp.route("/patients/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    return jsonify(patient.to_dict())


# -------------------------------------------------------
# DELETE /admin/patients/<id>
# -------------------------------------------------------

@admin_bp.route("/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    from database import db
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    db.session.delete(patient)
    db.session.commit()
    return jsonify({"message": f"Patient {patient_id} deleted"})
