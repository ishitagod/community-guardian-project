"""Evaluate the local classifier with train/test split. Run from backend/:
    python evaluate_classifier.py
"""

import json
import sys
from pathlib import Path

import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

DATA_PATH = Path(__file__).parent / "data" / "labeled_samples.json"


def build_pipeline() -> Pipeline:
    return Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=8000, sublinear_tf=True, min_df=1)),
        ("clf",   LogisticRegression(max_iter=1000, C=2.0, class_weight="balanced", solver="lbfgs")),
    ])


def main():
    with open(DATA_PATH) as f:
        samples = json.load(f)

    texts  = [s["text"]  for s in samples]
    labels = [s["label"] for s in samples]
    classes = sorted(set(labels))

    print(f"\nDataset: {len(samples)} samples")
    for c in classes:
        print(f"  {c}: {labels.count(c)}")

    # 5-fold cross-validation (stratified — fair with 60 samples)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    y_pred = cross_val_predict(build_pipeline(), texts, labels, cv=cv)

    print(f"\n{'─'*50}")
    print("5-fold cross-validation results\n")
    print(classification_report(labels, y_pred, target_names=classes, digits=3))

    cm = confusion_matrix(labels, y_pred, labels=classes)
    print("Confusion matrix (rows=actual, cols=predicted):")
    header = f"{'':>12}" + "".join(f"{c:>12}" for c in classes)
    print(header)
    for i, row in enumerate(cm):
        print(f"{classes[i]:>12}" + "".join(f"{v:>12}" for v in row))

    # Per-class confidence calibration check
    pipe = build_pipeline()
    pipe.fit(texts, labels)
    probas = pipe.predict_proba(texts)
    print(f"\nMean confidence per class (training set):")
    for i, c in enumerate(pipe.classes_):
        mask = np.array(labels) == c
        mean_conf = probas[mask, i].mean()
        print(f"  {c}: {mean_conf:.3f}")


if __name__ == "__main__":
    main()
