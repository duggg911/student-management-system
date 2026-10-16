
import time

import mlflow
import mlflow.sklearn
from flask import Flask, request, jsonify
from prometheus_client import Counter, Histogram, generate_latest
from prometheus_client import CONTENT_TYPE_LATEST

app = Flask(__name__)

# Load the registered MLflow model, version 1
mlflow.set_tracking_uri("sqlite:///mlflow.db")
model = mlflow.sklearn.load_model("models:/IrisClassifier/1")

# Prometheus monitoring metrics
PREDICTIONS = Counter(
    "model_predictions_total",
    "Total number of successful model predictions"
)

REQUESTS = Counter(
    "api_requests_total",
    "Total number of API requests"
)

LATENCY = Histogram(
    "prediction_request_duration_seconds",
    "Prediction request duration in seconds"
)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "ML model API is running",
        "model": "IrisClassifier",
        "version": 1
    })


@app.route("/predict", methods=["POST"])
def predict():
    REQUESTS.inc()
    start = time.time()

    try:
        data = request.get_json(silent=True) or {}
        features = data.get("features")

        if not isinstance(features, list) or len(features) != 4:
            return jsonify({
                "error": "Provide exactly 4 numeric features"
            }), 400

        try:
            features = [float(value) for value in features]
        except (TypeError, ValueError):
            return jsonify({"error": "Features must be numeric"}), 400

        with LATENCY.time():
            prediction = int(model.predict([features])[0])

        PREDICTIONS.inc()

        return jsonify({
            "prediction": prediction,
            "class_name": ["setosa", "versicolor", "virginica"][prediction],
            "model_version": 1
        })

    except Exception:
        app.logger.exception("Prediction failed")
        return jsonify({"error": "Prediction failed"}), 500


@app.route("/metrics", methods=["GET"])
def metrics():
    return generate_latest(), 200, {
        "Content-Type": CONTENT_TYPE_LATEST
    }


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
