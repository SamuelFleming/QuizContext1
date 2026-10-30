# IFN680 Assessment 2 — Project 1 QuizContext Knowledge Notes

> **Intended use:** Detailed, source-grounded notes to supply to QuizContext for creating an individual oral-examination-style mini exam. Focus on explaining submitted implementation, interpreting exact results, identifying theory from Tutorials 1–2, and distinguishing completed work from hypothetical improvements.

## 1. Assessment context and learning objective

**Title:** Wine quality — Polynomial regression and model selection. The specification requires a `PolynomialFeatures` + `LinearRegression` pipeline that predicts a **continuous wine-quality score** and studies the **bias–variance trade-off** by testing polynomial degrees **1–6**. The point is to select the degree that minimises **validation MSE**, not necessarily training MSE.

### Required tasks

1. **Train and evaluate** six polynomial degrees; report training and validation performance; select best degree.
2. **Save** a fitted Scikit-Learn `make_pipeline(PolynomialFeatures, LinearRegression)` as `best_model.joblib` and check it via `assignment_1.py`.
3. **Reproduce** the selected model's test-set metric and training/validation table/figure in `main_report.ipynb`.
4. **Report questions:** A—complexity trends; B—first train/validation decoupling; C—bias and variance at low/high complexity; D—recommend a production degree with validation-based justification.

### Submitted resources and roles

- `development.ipynb`: load, clean, normalise, split, sweep six degrees, select, train final pipeline, save and smoke-test.
- `main_report.ipynb`: repeat preparation, load the saved pipeline, calculate test MSE, reproduce degree sweep, tables, log-scale chart and summary metrics.
- `assignment_1.py`: `load_best_model()` calls `joblib.load('best_model.joblib')`; `predict_quality(X_normed_features)` loads the model then calls `.predict(X_normed_features)`.
- Submitted technical report: interprets trends, first divergence, bias/variance and recommendation (degree 2).
- `Project1Summary.md`: preparatory summary describing project requirements, not additional experimental evidence.

## 2. Data, target and preprocessing — exact submitted flow

```python
wine_df = pd.read_csv('data.csv')
wine_df = wine_df.dropna()
wine_df = wine_df.drop_duplicates()
# Result reported by notebook: (4421, 13)
X = wine_df.drop(['wine_type', 'quality'], axis=1)
y = wine_df['quality']
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

The target is `quality`, a numerical wine score. There are **11 numerical input features**, the wine's chemical/physical characteristics. `wine_type` is **not** a feature; unlike Tutorial 2, it is **not** the prediction target. `dropna()` removes rows with missing values; `drop_duplicates()` removes duplicate rows. The resulting DataFrame was **4,421 × 13**.

**Actual split sequence:**

```python
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train, y_train, test_size=0.25, random_state=42
)
```

- Test: 20% of all records = **885** rows.
- Training+validation development portion: 80% of all records = 3,536 rows.
- Validation: 25% of development portion = **884** rows, equivalent to 20% overall.
- Training: 75% of development = **2,652** rows, equivalent to 60% overall.
- `random_state=42` makes the two splits reproducible for the same data and library behaviour.

**Important distinction:** The **submitted code** performs `scaler.fit_transform(X)` **before** splitting, which means its fitted scaling parameters use data from all partitions. This is a preprocessing leakage limitation; do not claim we fitted the scaler only on training. The saved pipeline also does not contain the scaler. These limitations do not nullify the recorded notebook metrics, but qualify their interpretation and portability.

### StandardScaler / Z-score

For a feature value `x`, standardisation is `(x - μ) / σ`, with mean `μ` and standard deviation `σ` learned from the data supplied to `fit`. It places features measured in different units on comparable scales and can improve numerical conditioning. **Standardisation does not itself prevent overfitting.**

## 3. Polynomial regression: what changes with degree?

- `PolynomialFeatures(degree=d)` adds polynomial powers and cross-feature interaction terms up to `d`.
- With two input variables, degree 2 includes (up to a constant) `x1`, `x2`, `x1²`, `x1*x2`, `x2²`.
- Conceptual two-feature model: `ŷ = β0 + β1 x1 + β2 x2 + β3 x1² + β4 x1 x2 + β5 x2²`.
- The **input representation** is nonlinear, but ordinary `LinearRegression` is still **linear in the fitted coefficients β**.
- Degree controls the size and flexibility of the feature space. Higher degrees generally create many additional terms, allowing closer training fit but increasing susceptibility to overfitting and unstable predictions.
- **Polynomial degree is a hyperparameter** (chosen from candidates using validation data). Regression coefficients are **parameters** (learned by fitting the training data).
- `PolynomialFeatures` has `include_bias=True` by default; the submitted notebook does not specify a different value. The task is understanding its transformation, rather than manually calculating individual coefficients.

### Actual implementation loop

```python
degrees = range(1, 7)
train_errors = []
val_errors = []
for degree in degrees:
    poly = PolynomialFeatures(degree=degree)
    X_train_poly = poly.fit_transform(X_train)
    X_val_poly = poly.transform(X_val)
    model = LinearRegression()
    model.fit(X_train_poly, y_train)
    y_train_pred = model.predict(X_train_poly)
    y_val_pred = model.predict(X_val_poly)
    train_mse = mean_squared_error(y_train, y_train_pred)
    val_mse = mean_squared_error(y_val, y_val_pred)
    train_errors.append(train_mse)
    val_errors.append(val_mse)
```

Explain line by line:

1. `range(1,7)` generates six candidates: 1,2,3,4,5,6.
2. `fit_transform(X_train)` constructs the training polynomial design matrix.
3. `transform(X_val)` applies the same feature mapping to validation rows.
4. `LinearRegression().fit(...)` estimates coefficients from transformed **training** samples.
5. `.predict(...)` produces continuous quality-score estimates.
6. `mean_squared_error(...)` scores average squared deviations against the true scores.
7. The lists preserve paired error values for model selection and plotting.

## 4. Evaluation metric and partitions

**Mean squared error (MSE)**: `MSE = (1/n) Σ_i (y_i − ŷ_i)²`. It is non-negative, lower is better, and squaring emphasises large prediction mistakes. Its units are squared quality-score units. It is suitable here because this is a **regression** task.

**Training MSE** assesses fit on rows used to estimate coefficients. **Validation MSE** assesses candidate generalisation on rows excluded from coefficient fitting, while informing degree selection. **Test MSE** is intended as the final check after selecting the hyperparameter; repeatedly using it to adjust the model would compromise its independence.

**Contrast to Tutorial 2:** The tutorial's red/white prediction is binary classification, so accuracy and confusion matrices are used. Classification accuracy should not be substituted for MSE in Project 1.

## 5. Exact experimental outputs (from both submitted notebooks)

| Degree | Training MSE | Validation MSE | Outcome |
|---:|---:|---:|---|
| 1 | 0.536079 | 0.571598 | More constrained model |
| 2 | 0.479120 | **0.547604** | **Minimum validation error** |
| 3 | 0.407528 | 0.839361 | First clear training/validation divergence |
| 4 | 0.207418 | 299.278767 | Large validation deterioration |
| 5 | **0.063852** | **114296.332178** | Lowest training error, worst validation error |
| 6 | 0.203076 | 6829.927206 | Still severe validation failure; training error rises from degree 5 |

**Chosen polynomial degree:** **2**. **Best validation MSE:** **0.547604**. **Saved-model test MSE:** **0.500912**.

### Interpreting submitted report Questions A–D

**A. Complexity trend:** Between degrees 1 and 2, both training and validation MSE decreased. Moving to degree 3 lowered training MSE but raised validation MSE. Degrees 4–6 produced validation errors of hundreds to hundreds of thousands, vastly exceeding the relatively small training errors.

**B. First divergence:** At **degree 3**, training MSE decreased from **0.479120 → 0.407528** while validation MSE increased from **0.547604 → 0.839361**. The degree-2 → degree-3 transition is the evidence for decoupling.

**C. Bias–variance diagnosis:** Degree 1's limited flexibility is consistent with greater bias relative to degree 2; degree 2's improvement suggests useful nonlinear structure. Higher-degree models' growing training/validation gap is consistent with increasing variance and overfitting. **Bias and variance were inferred from train/validation behaviour, not directly estimated by repeating experiments across datasets.**

**D. Model recommendation:** Degree **2** had the **lowest validation MSE**, making it the justified selection among 1–6. Test MSE **0.500912** was reasonably close to validation MSE **0.547604**. This is supporting evidence, not a proof of future production accuracy.

**Subtlety:** Training MSE is **not strictly decreasing** at every step: it rises from degree 5 to 6. Validation MSE also falls from degree 5 to 6 while remaining catastrophically high. Do not overstate monotonicity. The submitted report describes an overall trend, rather than a mathematically monotonic sequence.

### Report visualisation

`main_report.ipynb` plots both train and validation MSE against degree and calls `plt.yscale('log')`. The logarithmic y-axis is important because validation error varies over orders of magnitude; a linear axis makes the smaller results difficult to distinguish. A log scale changes visual spacing, **not the underlying MSE values**.

## 6. Final pipeline, saving, reloading and evaluation

```python
best_index = val_errors.index(min(val_errors))
best_degree_derived = degrees[best_index]  # 2
best_model = make_pipeline(
    PolynomialFeatures(degree=best_degree_derived),
    LinearRegression()
)
best_model.fit(X_train, y_train)
joblib.dump(best_model, 'best_model.joblib')
```

- `make_pipeline` chains feature expansion and model fitting/prediction.
- `joblib.dump` serialises the **fitted** pipeline.
- `assignment_1.py` defines:

```python
import joblib

def load_best_model():
    best_model = joblib.load('best_model.joblib')
    return best_model

def predict_quality(X_normed_features):
    best_model = load_best_model()
    return best_model.predict(X_normed_features)
```

- The notebook checks `best_model_pipeline = load_best_model()` and compares `predict(X_test)` to `y_test` using MSE; observed test MSE is **0.5009**.
- **What is inside the saved pipeline?** `PolynomialFeatures` and `LinearRegression`. **What is not inside?** `StandardScaler`. The caller must supply predictors pre-scaled with the same statistics and in the same column order. `X_normed_features` in the helper name hints at this expectation.
- The code fitted the selected model on **X_train only**, not the combined train+validation data.

## 7. Connections to the uploaded tutorials

### Week 1: Python/PyTorch refresher and the same wine dataset

The supplied **Week 1 description** emphasises inspecting/cleaning data with pandas, exploring histograms/pairplots/correlations, converting columns to PyTorch tensors, computing vector norms/feature means, Z-score and min-max normalisation, and implementing a 1-nearest-neighbour predictor with tensors and MSE. Its supplied notebook (`Week_1_correction.ipynb`) contains code for these steps.

Direct bridges:
- Same wine-quality data context, `read_csv`, `dropna` / duplicates and feature/target understanding.
- Z-score scaling concept appears in Week 1 PyTorch form and Project 1's Scikit-Learn `StandardScaler` form.
- Week 1's 1-NN predicts labels from closest training observations; Project 1's regression learns linear coefficients on expanded polynomial features. **They are not the same modelling algorithm.**
- MSE compares continuous predictions with true quality scores in both contexts.

Additional Week 1 topics potentially examinable as tutorial context, not claimed as Project 1 implementation: tensor slicing, Boolean masks, L2 norm, pair plots, correlation matrices, min-max scaling, and hand-coded nearest-neighbour distance calculations.

### Week 2: Classical classification and model selection

The **Week 2 description and notebook** cover binary red/white wine classification using Scikit-Learn, target encoding, normalisation and train/validation/test splitting. Three classifiers are trained/tuned:

- **KNN classifier:** hyperparameter `n_neighbors` / `k`, candidate values in notebook `range(1,45)`; measure validation **accuracy**.
- **Decision Tree:** sweep `max_depth` via `range(1,50)`; study complexity/overfitting and visualise the tree.
- **Random Forest:** sweep `n_estimators` via `range(1,150,5)`; inspect feature importance.
- **Test evaluation:** accuracy and confusion matrices to compare the three classifiers after tuning.

The Week 2 notebook contains unfilled `____` exercise placeholders, so do not claim the uploaded notebook provides completed tuned values or test results.

The **conceptual bridge** is the tuning workflow: choose a model-complexity hyperparameter; fit candidate models on training data; score them using validation data; select a candidate; then assess it on a held-out test set. Project 1 substitutes polynomial degree for `k`/tree depth, LinearRegression for classifiers, and **MSE** for classification accuracy.

| Dimension | Week 2 tutorial | Project 1 submission |
|---|---|---|
| Prediction target | `wine_type` (red/white) | `quality` (numeric score) |
| Learning type | Classification | Regression |
| Models | KNN, Decision Tree, Random Forest | PolynomialFeatures + LinearRegression |
| Tuned controls | `k`, depth, forest size | degree 1–6 |
| Validation metric | Accuracy | MSE |
| Final test analysis | Accuracy/confusion matrices | MSE |
| Common concept | Bias–variance, selection, generalisation | Same |

## 8. Retrospective critique — do not misrepresent as submitted actions

**1. Pre-split standardisation:** `StandardScaler().fit_transform(X)` used all rows *before* the train/val/test split. This leaks aggregate validation/test information into preprocessing. A corrected approach would split raw data first, fit scaling only on training data, then transform validation/test using that fitted scaler.

**2. Incomplete end-to-end pipeline:** The saved model expects already-scaled features. A more portable solution would save `make_pipeline(StandardScaler(), PolynomialFeatures(degree=2), LinearRegression())`, trained on unscaled `X_train`, and evaluate using matching raw input. **Do not claim that is the submitted pipeline.**

**3. Complexity control:** High polynomial degrees explode the number of features. Alternatives worth discussing (not submitted) include Ridge regularisation, limiting interaction terms, and cross-validation.

**4. Final refit:** It is common to consider retraining the chosen architecture using train+validation once degree selection is finished. The submitted code only trains the final artifact on the training set.

**5. Metric scope:** MSE was computed on one fixed split, not cross-validated; a single low test error provides limited evidence of generalisation. The report does not establish external population performance or uncertainty bounds.

## 9. Interview question bank with model answers

**Q1. What were the assessment deliverables?** Train/evaluate degrees 1–6; choose by validation MSE; save a pipeline as `best_model.joblib`; check held-out test performance; submit notebooks and a report discussing complexity/bias/variance/recommendation.

**Q2. What is the target variable and why is it regression?** Numerical wine `quality`; direct numerical predictions are scored by MSE, rather than predicting class `wine_type`.

**Q3. Why remove `wine_type` and `quality` from X?** `quality` is the target and must not appear among predictors. `wine_type` was intentionally not used as a predictor in the submitted feature set.

**Q4. How were the 60/20/20 splits created?** First 20% overall held out for testing; then 25% of the remaining 80% held for validation; gives 60%/20%/20%.

**Q5. Why separate training, validation and test?** Train learns parameters; validation chooses degree; test checks the chosen model without being used to choose it.

**Q6. What is MSE?** Mean of squared differences between predicted and true numerical quality scores; large deviations incur larger penalties.

**Q7. What is a polynomial feature?** Power or interaction of original inputs (e.g., `x²` or `x1*x2`), increasing the expressive feature space.

**Q8. Is polynomial regression a nonlinear-in-parameters model?** No; it is linear in coefficients after nonlinear feature transformation.

**Q9. What is the fitted parameter vs tuned hyperparameter?** Coefficients learned by LinearRegression are parameters; polynomial degree selected via validation is a hyperparameter.

**Q10. What was the selected degree and why?** 2, with minimum validation MSE 0.547604 among all candidates.

**Q11. Where does the overfitting pattern first emerge?** Degree 3: training MSE improves versus degree 2, validation MSE deteriorates.

**Q12. Why not select degree 5?** It had lowest training error (0.063852) but worst validation MSE (~114296.33); it does not generalise.

**Q13. What can cause high degrees to generalise poorly?** Many flexible features can fit peculiarities of training data and amplify prediction instability, creating high-variance behaviour.

**Q14. Did training error always decrease as degree increased?** No. Degree 6's training MSE was higher than degree 5's; the overall overfitting diagnosis remains.

**Q15. Why use a logarithmic axis?** Errors range from fractions to over 100,000; log scaling makes multiple orders of magnitude visible together.

**Q16. How do we know the saved model loads?** `assignment_1.load_best_model()` uses `joblib.load`, and the notebook successfully called `predict` and computed test MSE 0.5009.

**Q17. Does the saved pipeline handle raw feature inputs automatically?** No. It has polynomial transformation and linear regression but **not** scaling; inputs must already match the preprocessing.

**Q18. What is data leakage in our code?** Feature-standardisation statistics were learned using validation and test samples before the split.

**Q19. How would you eliminate leakage?** Split first; fit scaler on training only, ideally inside a pipeline trained on raw training features; transform holdouts with the fitted scaler.

**Q20. How does Tutorial 1's 1-NN compare?** Nearest-neighbour predicts from distances to stored examples, while polynomial regression learns coefficients; both use numerical features and can be evaluated with MSE.

**Q21. How does Tutorial 2's hyperparameter tuning compare?** It selects KNN `k`, tree depth or forest size by validation accuracy; Project 1 chooses polynomial degree by validation MSE.

**Q22. What does test MSE 0.500912 establish?** This model scored an average squared error of ~0.501 on its held-out test split; it supports but cannot guarantee generalisation to future data.

**Q23. What would you change if repeating Project 1?** Place scaling inside the pipeline, avoid leakage, explore cross-validation and regularisation, and consider final refitting after model selection.

**Q24. Why standardise features?** Wine properties vary in scale/units; standardisation places them on comparable scales and can improve numerical conditioning of expanded regression features.

## 10. Instructions for QuizContext question generation

Generate a mixed mini exam that tests *understanding*, not just numerical memorisation. Suggested distribution:

- **30% submitted implementation/code tracing:** preprocessing, split proportions, transformations, fitting, validation selection, saved pipeline and prediction helper.
- **25% interpretation of submitted results:** degree comparison, divergence at 3, why degree 2 wins, degree-5 failure, degree-6 nuance, log-scale chart.
- **25% theoretical reasoning:** polynomial features, bias–variance, model complexity, MSE, train/validation/test, generalisation.
- **15% Tutorial 1/2 bridges:** regression vs classification, 1-NN vs polynomial regression, KNN/tree/forest hyperparameter sweeps and metrics.
- **5% implementation critique:** leakage, missing saved scaler, alternative validation strategies.

Prefer oral-question styles such as **“Explain why…”**, **“Walk through this code…”**, **“Compare…”**, **“Interpret these metrics…”** and **“What would happen if…”**. Include a model answer and a brief rationale for each question. Vary difficulty from foundational to probing follow-ups. Avoid inventing training runs, alternative results, or model accuracy values not in the submitted artifacts. Clearly label hypothetical recommendations as hypothetical rather than steps the student performed.

## 11. Provenance

These notes were constructed from Project 1's task sheet, technical report, `development.ipynb`, `main_report.ipynb`, `assignment_1.py`, `Project1Summary.md`, Week 1 tutorial document and `Week_1_correction.ipynb`, and Week 2 tutorial document and `Week_2.ipynb`. Numerical results are transcribed from **saved executed notebook outputs**, not recomputed. Tutorial 2 exercises retain blanks in their provided notebook; no solution metrics were assumed.
