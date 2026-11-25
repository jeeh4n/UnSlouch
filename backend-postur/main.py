import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import builtins
import sys
import __main__
import scipy.sparse

# Patch kompatibilitas model .pkl
sys.modules["__builtin__"] = builtins
builtins.__main__ = __main__.__dict__
sys.modules["scipy._lib._sparse"] = scipy.sparse

import math
import sqlite3
import hashlib
import secrets
import threading
import traceback
from datetime import datetime
import cv2
import joblib
import mediapipe as mp
import numpy as np
import pandas as pd
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

# ==========================================
# 1. INISIALISASI APLIKASI, CORS, DB & MODEL
# ==========================================
app = FastAPI(title="API Deteksi Postur Tubuh")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "users.db")
MODEL_PATH = os.path.join(BASE_DIR, "champion_posture_model.pkl")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            token TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            pesan TEXT NOT NULL,
            durasi_detik INTEGER NOT NULL,
            probabilitas REAL NOT NULL,
            waktu TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

init_db()

BASE_FEATURES = ["D_shoulder", "theta_shoulder", "theta_head", "theta_neck_chest", "R_vertical"]

loaded_artifact = joblib.load(MODEL_PATH)
raw_pipeline = loaded_artifact["pipeline"]
CUSTOM_THRESHOLD = float(getattr(raw_pipeline, "threshold", 0.345))

base_pipe = raw_pipeline.base_pipeline
fe_step = base_pipe.named_steps["feat_eng"]
imputer_step = base_pipe.named_steps["imputer"]
scaler_step = base_pipe.named_steps["scaler"]
clf_step = base_pipe.named_steps["clf"]

if hasattr(clf_step, "set_params"):
    clf_step.set_params(n_jobs=1)

CLASS0_MEDIANS = fe_step.class0_medians_.to_dict()
CLASS0_IQR = fe_step.class0_iqr_.to_dict()
ENGINEERED_COLS = [
    "D_shoulder", 
    "theta_shoulder", 
    "theta_head", 
    "theta_neck_chest", 
    "R_vertical",
    "abs_theta_shoulder", 
    "abs_theta_head", 
    "head_shoulder_angle_diff", 
    "head_shoulder_same_dir",
    "lateral_instability_energy", 
    "slouch_severity_ratio", 
    "neck_compression_product",
    "implied_ear_to_shoulder_span", 
    "apparent_neck_height_norm", 
    "foreshortening_index", 
    "ergonomic_deviation_score"
]

if not hasattr(mp, "solutions"):
    raise RuntimeError(
        "\n===================================================================\n"
        "[ERROR] Modul 'mediapipe.solutions' tidak ditemukan!\n"
        "Ini terjadi karena Anda menjalankan dengan Python 3.13 (global).\n"
        "Silakan jalankan backend menggunakan virtual environment (Python 3.10):\n\n"
        "   cd backend-postur\n"
        "   .\\venv\\Scripts\\activate\n"
        "   uvicorn main:app --reload\n\n"
        "Atau jalankan langsung uvicorn dari venv:\n"
        "   .\\venv\\Scripts\\uvicorn.exe main:app --reload\n"
        "===================================================================\n"
    )

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=0,
    smooth_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)
pose_lock = threading.Lock()

# ==========================================
# 2. SCHEMA & HELPER AUTENTIKASI
# ==========================================
class UserRegister(BaseModel):
    email: str
    password: str

class HistoryCreate(BaseModel):
    pesan: str
    durasi_detik: int
    probabilitas: float

class HistoryDelete(BaseModel):
    ids: list[int]

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM users WHERE token = ?", (token,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau sesi telah berakhir. Silakan login ulang.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user[0]

# ==========================================
# 3. ENDPOINT AUTENTIKASI
# ==========================================
@app.post("/register", tags=["Autentikasi"])
def register(user: UserRegister):
    email_clean = user.email.strip().lower()
    if not email_clean or not user.password:
        raise HTTPException(status_code=400, detail="Email dan password wajib diisi.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            (email_clean, hash_password(user.password)),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Email sudah terdaftar.")
    conn.close()

    return {"status": "sukses", "pesan": f"Akun '{email_clean}' berhasil dibuat."}

@app.post("/login", tags=["Autentikasi"])
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    email_input = form_data.username.strip().lower()
    
    cursor.execute("SELECT id, email, hashed_password FROM users WHERE email = ?", (email_input,))
    row = cursor.fetchone()

    if not row or row[2] != hash_password(form_data.password):
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = secrets.token_hex(32)
    cursor.execute("UPDATE users SET token = ? WHERE id = ?", (access_token, row[0]))
    conn.commit()
    conn.close()

    return {"access_token": access_token, "token_type": "bearer", "email": row[1]}

@app.get("/me", tags=["Autentikasi"])
def get_me(current_user: str = Depends(get_current_user)):
    return {"status": "sukses", "email": current_user}

# ==========================================
# 4. EKSTRAKSI FITUR & ANALISIS POSTUR
# ==========================================
def preprocess_image(img_bgr, max_dim: int = 640):
    if img_bgr is None or img_bgr.size == 0:
        return None

    img = img_bgr
    if img.dtype != np.uint8:
        img = np.clip(img, 0, 255).astype(np.uint8)

    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    elif img.ndim == 3 and img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
    elif img.ndim != 3 or img.shape[2] != 3:
        return None

    h, w = img.shape[:2]
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img = cv2.resize(img, (int(round(w * scale)), int(round(h * scale))), interpolation=cv2.INTER_AREA)

    return np.ascontiguousarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

def extract_5_features(pose_landmarks, img_w: int, img_h: int):
    lm = pose_landmarks.landmark
    vis_thresh = 0.45

    def get_xyv(idx: int):
        pt = lm[idx]
        return float(pt.x * img_w), float(pt.y * img_h), float(getattr(pt, "visibility", 1.0))

    nx, ny, n_vis = get_xyv(0)
    lex, ley, le_vis = get_xyv(7)
    rex, rey, re_vis = get_xyv(8)
    lsx, lsy, ls_vis = get_xyv(11)
    rsx, rsy, rs_vis = get_xyv(12)

    if ls_vis < 0.25 or rs_vis < 0.25: return None
    d_shoulder_px = math.hypot(lsx - rsx, lsy - rsy)
    if d_shoulder_px < 1e-3: return None

    le_ok, re_ok, nose_ok = le_vis >= vis_thresh, re_vis >= vis_thresh, n_vis >= vis_thresh
    if not le_ok and re_ok and nose_ok: lex, ley = 2.0 * nx - rex, rey
    elif not re_ok and le_ok and nose_ok: rex, rey = 2.0 * nx - lex, ley
    elif not le_ok and not re_ok:
        if le_vis >= 0.20 and re_vis >= 0.20: pass
        elif nose_ok:
            half_ear_span = 0.175 * d_shoulder_px
            lex, ley = nx + half_ear_span, ny
            rex, rey = nx - half_ear_span, ny
        else: return None

    d_shoulder_norm = d_shoulder_px / float(img_w)
    theta_shoulder = math.degrees(math.atan2(lsy - rsy, max(abs(lsx - rsx), 1e-6)))
    theta_head = math.degrees(math.atan2(ley - rey, max(abs(lex - rex), 1e-6)))

    ms_x, ms_y = 0.5 * (lsx + rsx), 0.5 * (lsy + rsy)
    chest_x, chest_y = ms_x, ms_y + (0.50 * d_shoulder_px)

    u_vec = np.array([lex - chest_x, ley - chest_y])
    v_vec = np.array([rex - chest_x, rey - chest_y])
    norm_u, norm_v = np.linalg.norm(u_vec), np.linalg.norm(v_vec)

    if norm_u < 1e-6 or norm_v < 1e-6: return None

    cos_theta = float(np.dot(u_vec, v_vec) / (norm_u * norm_v))
    theta_neck_chest = math.degrees(math.acos(np.clip(cos_theta, -1.0, 1.0)))
    r_vertical = (ms_y - 0.5 * (ley + rey)) / d_shoulder_px

    return [round(d_shoulder_norm, 6), round(theta_shoulder, 4), round(theta_head, 4), round(theta_neck_chest, 4), round(r_vertical, 6)]

def build_16_features(base_values: list) -> pd.DataFrame:
    df_in = pd.DataFrame([base_values], columns=BASE_FEATURES).copy()
    d_sh = df_in["D_shoulder"]
    th_sh = df_in["theta_shoulder"]
    th_hd = df_in["theta_head"]
    th_nc = df_in["theta_neck_chest"]
    r_vert = df_in["R_vertical"]
    r_vert_safe = np.maximum(np.abs(r_vert), 0.05)

    df_in["abs_theta_shoulder"] = np.abs(th_sh)
    df_in["abs_theta_head"] = np.abs(th_hd)
    df_in["head_shoulder_angle_diff"] = np.abs(th_hd - th_sh)
    df_in["head_shoulder_same_dir"] = np.sign(th_hd) * np.sign(th_sh) * np.sqrt(np.abs(th_hd * th_sh))
    df_in["lateral_instability_energy"] = (th_sh ** 2) + (th_hd ** 2)
    df_in["slouch_severity_ratio"] = th_nc / r_vert_safe
    df_in["neck_compression_product"] = th_nc * (1.0 - r_vert)
    half_apex_rad = np.radians(np.clip(th_nc, 1.0, 170.0) / 2.0)
    df_in["implied_ear_to_shoulder_span"] = 2.0 * (r_vert + 0.50) * np.tan(half_apex_rad)
    df_in["apparent_neck_height_norm"] = r_vert * d_sh
    df_in["foreshortening_index"] = d_sh / r_vert_safe

    z_deviations = np.zeros(len(df_in))
    for col in BASE_FEATURES:
        z_col = (df_in[col] - CLASS0_MEDIANS[col]) / CLASS0_IQR[col]
        z_deviations += z_col ** 2
    df_in["ergonomic_deviation_score"] = np.sqrt(z_deviations)

    return df_in[ENGINEERED_COLS]

def _run_posture_inference(contents: bytes, current_user: str):
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_rgb = preprocess_image(img, max_dim=640)
    if img_rgb is None:
        raise HTTPException(status_code=400, detail="Gambar tidak valid.")

    img_h, img_w = img_rgb.shape[:2]
    with pose_lock:
        results = pose.process(img_rgb)

    if not results.pose_landmarks:
        return {"status": "gagal", "pesan": "Tubuh manusia tidak terdeteksi."}

    fitur_5 = extract_5_features(results.pose_landmarks, img_w, img_h)
    if fitur_5 is None:
        return {"status": "gagal", "pesan": "Titik bahu/telinga tidak jelas."}

    lm = results.pose_landmarks.landmark
    titik_tubuh = {
        "nose": {"x": lm[0].x, "y": lm[0].y},
        "left_ear": {"x": lm[7].x, "y": lm[7].y},
        "right_ear": {"x": lm[8].x, "y": lm[8].y},
        "left_shoulder": {"x": lm[11].x, "y": lm[11].y},
        "right_shoulder": {"x": lm[12].x, "y": lm[12].y},
    }

    df_16 = build_16_features(fitur_5)
    X_imputed = imputer_step.transform(df_16)
    X_scaled = scaler_step.transform(X_imputed)

    prob_buruk = float(clf_step.predict_proba(X_scaled)[0][1])
    decision_threshold = float(os.getenv("POSTURE_THRESHOLD", CUSTOM_THRESHOLD))
    angka_hasil = 1 if prob_buruk >= decision_threshold else 0
    postur_akhir = "Duduk Benar / Tegak" if angka_hasil == 0 else "Duduk Salah / Bungkuk"

    return {
        "status": "sukses",
        "email": current_user,
        "hasil": {
            "target_prediksi": angka_hasil,
            "analisis_AI": postur_akhir,
            "probabilitas": round(prob_buruk, 4),
            "fitur": dict(zip(BASE_FEATURES, fitur_5)),
            "titik_tubuh": titik_tubuh,
        },
    }

@app.post("/analyze", tags=["Analisis Postur"])
async def analyze_posture(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    try:
        contents = await file.read()
        return await run_in_threadpool(_run_posture_inference, contents, current_user)
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "pesan": str(e)}

# ==========================================
# 5. ENDPOINT RIWAYAT NOTIFIKASI
# ==========================================
@app.post("/history", tags=["Riwayat Notifikasi"])
def save_history(item: HistoryCreate, current_user: str = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    waktu_lokal = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        "INSERT INTO history (email, pesan, durasi_detik, probabilitas, waktu) VALUES (?, ?, ?, ?, ?)",
        (current_user, item.pesan, item.durasi_detik, item.probabilitas, waktu_lokal),
    )
    conn.commit()
    conn.close()
    return {"status": "sukses", "pesan": "Riwayat disimpan."}

@app.get("/history", tags=["Riwayat Notifikasi"])
def get_my_history(current_user: str = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, pesan, durasi_detik, probabilitas, waktu FROM history WHERE email = ? ORDER BY id DESC LIMIT 100", (current_user,))
    rows = cursor.fetchall()
    conn.close()

    return {"status": "sukses", "data": [{"id": r[0], "pesan": r[1], "durasi_detik": r[2], "probabilitas": r[3], "waktu": r[4]} for r in rows]}

@app.delete("/history", tags=["Riwayat Notifikasi"])
def clear_my_history(current_user: str = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM history WHERE email = ?", (current_user,))
    conn.commit()
    conn.close()
    return {"status": "sukses"}

@app.post("/history/delete", tags=["Riwayat Notifikasi"])
def delete_history_items(body: HistoryDelete, current_user: str = Depends(get_current_user)):
    """Hapus beberapa peringatan sekaligus (hanya milik user yang sedang login)."""
    if not body.ids:
        return {"status": "sukses", "dihapus": 0}

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    marks = ",".join("?" * len(body.ids))
    cursor.execute(
        f"DELETE FROM history WHERE email = ? AND id IN ({marks})",
        (current_user, *body.ids),
    )
    dihapus = cursor.rowcount
    conn.commit()
    conn.close()
    return {"status": "sukses", "dihapus": dihapus}