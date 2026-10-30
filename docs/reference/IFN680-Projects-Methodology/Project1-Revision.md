# IFN680 Assessment 2 — Project 1 Revision Sheet

**Project:** Wine Quality — Polynomial Regression and Model Selection  
**Primary tutorial:** Week 2 (classical ML, model selection, bias–variance)  
**Supporting tutorial:** Week 1 (wine dataset, cleaning, scaling, MSE)  
**Purpose:** A concise oral-interview revision sheet based on the submitted task sheet, code and report.

## 1. Thirty-to-sixty-second interview explanation

> Project 1 investigated how polynomial regression complexity affects prediction of continuous wine quality scores. We cleaned the wine dataset, selected 11 numerical chemical properties as inputs, standardised them, and made 60/20/20 training/validation/test splits. We expanded the features to polynomial degrees 1 through 6, fitted a `LinearRegression` model for each, and compared training and validation mean squared error. Degree 2 was best on validation data (MSE **0.5476**). At degree 3, training error decreased but validation error increased: the start of clear overfitting. Higher-degree models performed especially poorly on validation data. We saved a degree-2 `PolynomialFeatures` + `LinearRegression` pipeline with `joblib`; it achieved a held-out test MSE of **0.5009**. The project demonstrates choosing complexity for generalisation rather than training fit.

## 2. What did the assessment ask?

- **Task 1:** Train polynomial regression models at degrees **1–6**, calculate training and validation errors, and choose the best degree.
- **Task 2:** Build the chosen `make_pipeline(PolynomialFeatures, LinearRegression)`, fit it, and save it as `best_model.joblib`. Verify loading and predicting through the supplied `assignment_1.py` helper.
- **Task 3:** In `main_report.ipynb`, load the saved model, evaluate the held-out test set and generate report tables/figures.
- **Report A–D:** Explain (A) complexity trends, (B) the first training/validation divergence, (C) bias and variance at low versus high degrees, and (D) recommended final degree using validation metrics.

**This is regression, not classification:** predict numerical `quality`; `wine_type` was excluded as a predictor. Tutorial 2 instead predicts the red/white class.

## 3. What exactly did our notebooks do?

1. Loaded `data.csv` into pandas; called `dropna()` and `drop_duplicates()`: **4,421 rows, 13 columns** remained.
2. Set `X = wine_df.drop(['wine_type','quality'], axis=1)` (**11 predictors**) and `y = wine_df['quality']`.
3. Applied `StandardScaler().fit_transform(X)` to numerical predictors.
4. Split with `random_state=42`: first **80% development / 20% test**, then **75% of development / 25% validation**, giving **2,652 training (60%)**, **884 validation (20%)**, **885 test (20%)**.
5. For each `degree` in `range(1, 7)`: `PolynomialFeatures(degree).fit_transform(X_train)`, transform validation features, fit `LinearRegression`, predict train/validation, and append MSE to arrays.
6. Chose `degrees[val_errors.index(min(val_errors))]` = **2**.
7. Made `make_pipeline(PolynomialFeatures(degree=2), LinearRegression())`, fitted it on **training data** and saved with `joblib.dump`.
8. Loaded the pipeline using `assignment_1.load_best_model()` and tested it once on `X_test`; `main_report.ipynb` reproduced the metrics and plotted the training/validation curves on a **logarithmic y-axis**.

**Key libraries:** pandas, Scikit-Learn (`train_test_split`, `StandardScaler`, `PolynomialFeatures`, `LinearRegression`, `mean_squared_error`, `make_pipeline`), matplotlib, joblib.

## 4. Actual submitted results

| Degree | Train MSE | Validation MSE | Interpretation |
|---:|---:|---:|---|
| 1 | 0.536079 | 0.571598 | Simple, somewhat more constrained |
| **2** | **0.479120** | **0.547604** | **Lowest validation MSE; selected** |
| 3 | 0.407528 | 0.839361 | Training improves; validation worsens |
| 4 | 0.207418 | 299.278767 | Severe overfitting |
| 5 | 0.063852 | 114296.332178 | Extreme training–validation gap |
| 6 | 0.203076 | 6829.927206 | Still severe overfitting; errors not monotonic |

**Final held-out test MSE:** **0.500912** for the saved degree-2 model.

### Four report questions — oral answers

- **A. What happens with complexity?** Moving from degree 1 to 2 improved both train and validation MSE. Beyond degree 2, training fit improved initially but validation performance degraded dramatically.
- **B. When does performance decouple?** **Degree 3**: train MSE **0.4791 → 0.4075** while validation MSE **0.5476 → 0.8394**.
- **C. Bias and variance?** A less flexible degree-1 model has relatively higher bias; high degrees fit training samples increasingly closely but show large unseen-data errors, consistent with high variance/overfitting. The experiment does **not** directly measure statistical bias/variance.
- **D. Production choice?** **Degree 2**, because validation MSE **0.5476** was lowest among tested candidates. Test MSE **0.5009** gave additional, limited support for generalisation.

**Nuance:** Training error did **not** decline monotonically: degree 6 training MSE exceeded degree 5. Avoid saying that it always improved with each degree. The major conclusion is the dramatic validation deterioration at high degrees.

## 5. Theory you must understand

- **Polynomial regression:** Extends inputs with powers and interactions. For two inputs, degree 2 can include `x1`, `x2`, `x1²`, `x1*x2`, `x2²`. The fitted regression remains **linear in coefficients**, even though it models nonlinear relationships in inputs.
- **Degree is a hyperparameter:** It controls feature-space complexity and is selected using the validation set, not learned as a regression coefficient.
- **MSE:** `mean((y_true - y_pred)²)`; lower is better; strongly penalises large mistakes. Here the target was the continuous quality score.
- **Underfitting / higher bias:** Too little flexibility to capture signal; train and validation performance are both limited.
- **Overfitting / higher variance:** Very low training error paired with much worse validation error. High degrees also create many more polynomial terms.
- **Generalisation:** Performance on new, unseen data. Training data fits parameters, validation data selects degree, test data provides a final check.
- **Feature scaling:** Z-score standardisation `(x - mean) / std`. In our *submitted code* it happened **before** splitting.
- **Pipeline:** Packages polynomial transformation and regression so the same feature expansion is applied at prediction time. The saved pipeline **did not include the StandardScaler**.

## 6. Tutorial connections

| Tutorial | Concept | Link to Project 1 |
|---|---|---|
| Week 1 | pandas loading, inspection, missing values, duplicates | Same preprocessing on wine data |
| Week 1 | Z-score/min-max scaling and linear algebra | We used `StandardScaler` on 11 wine predictors |
| Week 1 | Homemade PyTorch 1-nearest-neighbour regression, MSE | Same idea of predicting numeric wine quality and assessing MSE, but a different model |
| Week 2 | Scikit-Learn supervised learning and data partitions | Same training/validation/test workflow |
| Week 2 | KNN `k`, tree-depth, forest-estimator sweeps | Analogous hyperparameter sweep, here polynomial degree 1–6 |
| Week 2 | Bias–variance and generalisation | Central interpretation of our error curves |
| Week 2 | Accuracy/confusion matrices for classification | Contrast: Project 1 is regression, so used MSE instead |

## 7. Code that you should be able to describe

```python
for degree in range(1, 7):
    poly = PolynomialFeatures(degree=degree)
    X_train_poly = poly.fit_transform(X_train)
    X_val_poly = poly.transform(X_val)
    model = LinearRegression()
    model.fit(X_train_poly, y_train)
    train_errors.append(mean_squared_error(y_train, model.predict(X_train_poly)))
    val_errors.append(mean_squared_error(y_val, model.predict(X_val_poly)))
```

- `fit_transform` sets up feature expansion for training; `transform` applies it consistently to validation.
- `model.fit(...)` learns coefficients; `model.predict(...)` produces quality estimates.
- `min(val_errors)` identifies the best degree **according to unseen validation performance**.
- `joblib.dump(...)` saves the fitted pipeline; `assignment_1.py` uses `joblib.load(...)` and `predict(...)`.

## 8. Critical reflection — improvements, **not** what we submitted

1. **Preprocessing leakage:** We fitted `StandardScaler` on **all** `X` before splitting. Validation/test distribution information therefore influenced scaling. A better design fits the scaler on training data and applies it unchanged elsewhere, preferably as the first step in the saved pipeline.
2. **Deployment completeness:** Saved pipeline included polynomial expansion + regression, **not the scaler**. External callers must supply input features already standardised exactly as in training. For production, include fitted scaling inside the saved pipeline.
3. **More robust selection:** Consider cross-validation or regularised polynomial regression (e.g. Ridge) to reduce sensitivity to splits and high-dimensional expanded features. These were **not part of the submitted experiment**.
4. **Data usage:** The selected final model was fitted on `X_train` only; after choosing hyperparameters, one could consider refitting on train+validation before an untouched test evaluation. This was **not done**.
5. **Evaluation interpretation:** Test MSE slightly below validation MSE does not prove production robustness; it is one held-out estimate under this split and preprocessing.

## 9. Quick-fire interview prompts

1. Why is this regression rather than classification? **Numerical `quality`, evaluated by MSE.**
2. Why not choose the best training MSE? **Overfitting; choose by validation generalisation.**
3. What changed between degrees 2 and 3? **Train error fell, validation error rose.**
4. Why did degree 5 fail? **Huge number of fitted terms; extraordinarily high variance-like validation error.**
5. What is the meaning of `PolynomialFeatures`? **Constructs powers and interactions of input columns.**
6. Is polynomial regression still linear regression? **Yes, linear in fitted coefficients.**
7. Why split into three sets? **Fit parameters / select complexity / final assessment.**
8. Why a log-scale graph? **Validation MSE spans orders of magnitude.**
9. What did `joblib` save? **Fitted feature-expansion and regression pipeline, but not scaling.**
10. What limitation might examiners identify? **Scaling fitted before splitting; leakage and incomplete preprocessing artifact.**

**Sources:** Submitted `development.ipynb`, `main_report.ipynb`, `assignment_1.py`, Project 1 report and task sheet; Tutorial 1 description and `Week_1_correction.ipynb`; Tutorial 2 description and `Week_2.ipynb`. No rerunning or replacement of submitted results.
