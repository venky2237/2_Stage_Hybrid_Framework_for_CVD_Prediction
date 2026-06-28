from datetime import datetime, timezone
from database import db


def utcnow():
    """Timezone-aware UTC timestamp — replaces deprecated datetime.utcnow."""
    return datetime.now(timezone.utc)


class Patient(db.Model):
    __tablename__ = "patients"

    id            = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name          = db.Column(db.String(120), nullable=False)

    # Demographics
    age           = db.Column(db.Float)
    gender        = db.Column(db.String(10))
    height        = db.Column(db.Float)
    weight        = db.Column(db.Float)
    bmi           = db.Column(db.Float)

    # Vitals
    ap_hi         = db.Column(db.Float)
    ap_lo         = db.Column(db.Float)

    # Lab values (raw mg/dL)
    cholesterol   = db.Column(db.Float)
    glucose       = db.Column(db.Float)

    # Categories derived from raw values
    chol_category = db.Column(db.String(30))
    gluc_category = db.Column(db.String(30))

    # Lifestyle
    smoke         = db.Column(db.Boolean)
    alco          = db.Column(db.Boolean)
    active        = db.Column(db.Boolean)

    # Prediction results
    stage1_risk   = db.Column(db.Float)          # Clinical model probability
    stage2_risk   = db.Column(db.Float)          # MRI model probability (nullable)
    high_risk     = db.Column(db.Boolean)

    # Timestamps
    created_at    = db.Column(db.DateTime(timezone=True), default=utcnow)
    updated_at    = db.Column(db.DateTime(timezone=True), default=utcnow,
                              onupdate=utcnow)

    def to_dict(self):
        return {
            "id":            self.id,
            "name":          self.name,
            "age":           self.age,
            "gender":        self.gender,
            "height":        self.height,
            "weight":        self.weight,
            "bmi":           self.bmi,
            "bp":            f"{self.ap_hi}/{self.ap_lo}",
            "cholesterol":   self.cholesterol,
            "chol_category": self.chol_category,
            "glucose":       self.glucose,
            "gluc_category": self.gluc_category,
            "smoke":         self.smoke,
            "alco":          self.alco,
            "active":        self.active,
            "stage1_risk":   self.stage1_risk,
            "stage2_risk":   self.stage2_risk,
            "high_risk":     self.high_risk,
            "last_checked":  self.updated_at.strftime("%Y-%m-%d %H:%M") if self.updated_at else None,
            "created_at":    self.created_at.strftime("%Y-%m-%d %H:%M") if self.created_at else None,
        }