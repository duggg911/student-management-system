
import mlflow
import mlflow.sklearn

from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Store experiments and model registry in a local database
mlflow.set_tracking_uri("sqlite:///mlflow.db")
mlflow.set_experiment("Student-Management-ML")

# Load sample classification dataset
iris = load_iris()

X_train, X_test, y_train, y_test = train_test_split(
    iris.data,
    iris.target,
    test_size=0.2,
    random_state=42,
    stratify=iris.target
)

# Train model and track experiment
n_estimators = 100

with mlflow.start_run() as run:
    model = RandomForestClassifier(
        n_estimators=n_estimators,
        random_state=42
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    # Log experiment parameters and metrics
    mlflow.log_param("model_type", "RandomForestClassifier")
    mlflow.log_param("n_estimators", n_estimators)
    mlflow.log_param("test_size", 0.2)
    mlflow.log_metric("accuracy", accuracy)

    # Save model and register its version
    mlflow.sklearn.log_model(
        sk_model=model,
        name="model",
        registered_model_name="IrisClassifier",
        skops_trusted_types=["sklearn.tree._tree.Tree"]
    )

    print("Experiment:", "Student-Management-ML")
    print("Run ID:", run.info.run_id)
    print("Accuracy:", round(accuracy, 4))
    print("Model registered as: IrisClassifier")

print("MLflow experiment completed successfully!")
