# Project 1 - Wine Quality, polynomial regression and model selection

Scope: Project 1 - Wine Quality, polynomial regression and model selection
Mode: Targeted
Difficulty: medium
Questions: 10 multiple choice, 10 short answer
Created: 2026-10-17T11:00:42.955Z

## Questions

### 1. A dataset is split by reserving 20% for testing, then reserving 25% of the remaining records for validation. What proportions of the original dataset are used for training, validation and testing?

- 60% training, 25% validation, 15% testing
- 60% training, 20% validation, 20% testing
- 75% training, 5% validation, 20% testing
- 55% training, 25% validation, 20% testing

### 2. Degree 2 achieved training MSE 0.479120 and validation MSE 0.547604. Degree 5 achieved training MSE 0.063852 and validation MSE 114296.332178. Which model-selection decision is best justified?

- Select degree 5 because higher degree guarantees lower prediction bias on new data.
- Select degree 2 because its validation performance provides stronger evidence of generalisation.
- Select degree 2 because a higher training MSE is always desirable.
- Select degree 5 because its training MSE is lower.

### 3. Why can a model containing x1² and x1*x2 still be fitted using LinearRegression?

- Polynomial expansion makes all input variables statistically independent.
- Degree-2 expansion replaces coefficient estimation with nearest-neighbour lookup.
- LinearRegression automatically removes nonlinear terms before fitting.
- The prediction remains linear in the fitted coefficients despite nonlinear transformations of the inputs.

### 4. From degree 2 to degree 3, training MSE fell from 0.479120 to 0.407528 while validation MSE rose from 0.547604 to 0.839361. What does this transition most directly suggest?

- Additional flexibility improves training fit but begins to harm generalisation.
- The validation set was used to estimate the regression coefficients.
- The degree-3 model underfits more because its training error is lower.
- Degree 3 must perform better on the test set because it fits training data better.

### 5. What input does the submitted best_model.joblib pipeline expect when predict_quality is called?

- Features already expanded into polynomial terms, because only LinearRegression is saved.
- The quality column together with the raw chemical features.
- Raw features, because StandardScaler is stored as the first pipeline step.
- Features already scaled using the original scaling statistics and arranged in the original feature order.

### 6. For three wines, the prediction errors y − ŷ are 1, −2 and 0 quality-score units. What is the MSE?

- 5/3 quality-score units squared
- 1 quality-score unit squared
- 5 quality-score units squared
- 1/3 quality-score units squared

### 7. Degree 5 had training MSE 0.063852 and validation MSE 114296.332178. Degree 6 had training MSE 0.203076 and validation MSE 6829.927206. Which interpretation is accurate?

- The validation improvement makes degree 6 preferable to degree 2.
- Training MSE rises and validation MSE falls, but degree 6 still generalises very poorly.
- Both errors decrease, confirming that increasing degree always improves the model.
- The higher training MSE proves that degree 6 has no overfitting problem.

### 8. Which statement correctly distinguishes the polynomial degree from the regression coefficients?

- Both are hyperparameters selected by comparing test MSE.
- Degree is a hyperparameter selected using validation performance, while coefficients are fitted on training data.
- Degree is a fitted parameter, while coefficients are hyperparameters chosen before training.
- Both are parameters learned automatically by LinearRegression.fit.

### 9. Why was a logarithmic y-axis useful for plotting training and validation MSE across degrees 1–6?

- It forces the validation-error curve to decrease as degree increases.
- It removes the influence of large prediction errors from the computed MSE.
- It converts MSE into classification accuracy.
- It makes errors spanning several orders of magnitude easier to compare without changing the underlying MSE values.

### 10. Which comparison correctly connects Project 1 with the red/white wine classification tutorial?

- Project 1 selects coefficients using test MSE, while the tutorial selects tree depth using training accuracy.
- Both predict wine_type and choose polynomial degree using accuracy.
- The classification tutorial uses MSE because red and white are continuous numerical targets.
- Both tune hyperparameters using validation data, but Project 1 evaluates continuous quality predictions using MSE rather than classification accuracy.

### 11. The submitted preprocessing called StandardScaler.fit_transform(X) before splitting the data. Explain the limitation and describe how you would correct it in a future implementation.

Short answer

### 12. Walk through how a single degree is evaluated in the polynomial-degree sweep, from the training features to the two recorded MSE values.

Short answer

### 13. Explain the bias–variance interpretation of degree 1, degree 2 and the high-degree models. What limitation applies to claims about bias and variance in this experiment?

Short answer

### 14. Degree 2 had validation MSE 0.547604 and saved-model test MSE 0.500912. What do these results support, and what do they not establish about deployment?

Short answer

### 15. A colleague wants to send raw chemical measurements directly to predict_quality. Explain why this is unsafe for the submitted artifact and propose a more portable saved pipeline for a future version.

Short answer

### 16. For two original predictors x1 and x2, describe the features created by degree-2 polynomial expansion and explain how an interaction term differs from a squared term.

Short answer

### 17. Explain what StandardScaler computes for each feature and why this can help polynomial regression. Does standardisation by itself prevent overfitting?

Short answer

### 18. After selecting degree 2, which data were used to fit the submitted final artifact? Explain how a hypothetical train-plus-validation refit would differ and what role the test set should retain.

Short answer

### 19. Compare the Week 1 one-nearest-neighbour quality predictor with Project 1's polynomial regression. How do they generate predictions, and why can MSE evaluate both?

Short answer

### 20. Explain why quality and wine_type were removed from the predictor table, and describe how using quality as an input would undermine this prediction task.

Short answer

## Answer key

### 1. A dataset is split by reserving 20% for testing, then reserving 25% of the remaining records for validation. What proportions of the original dataset are used for training, validation and testing?

Correct option: 60% training, 20% validation, 20% testing

Sources: Project1-QuizContext

### 2. Degree 2 achieved training MSE 0.479120 and validation MSE 0.547604. Degree 5 achieved training MSE 0.063852 and validation MSE 114296.332178. Which model-selection decision is best justified?

Correct option: Select degree 2 because its validation performance provides stronger evidence of generalisation.

Sources: Project 1 - Wine Quality, polynomial regression and model selection, Project1-QuizContext

### 3. Why can a model containing x1² and x1*x2 still be fitted using LinearRegression?

Correct option: The prediction remains linear in the fitted coefficients despite nonlinear transformations of the inputs.

Sources: Project1-QuizContext

### 4. From degree 2 to degree 3, training MSE fell from 0.479120 to 0.407528 while validation MSE rose from 0.547604 to 0.839361. What does this transition most directly suggest?

Correct option: Additional flexibility improves training fit but begins to harm generalisation.

Sources: Project1-QuizContext

### 5. What input does the submitted best_model.joblib pipeline expect when predict_quality is called?

Correct option: Features already scaled using the original scaling statistics and arranged in the original feature order.

Sources: Project1-QuizContext

### 6. For three wines, the prediction errors y − ŷ are 1, −2 and 0 quality-score units. What is the MSE?

Correct option: 5/3 quality-score units squared

Sources: Project1-QuizContext

### 7. Degree 5 had training MSE 0.063852 and validation MSE 114296.332178. Degree 6 had training MSE 0.203076 and validation MSE 6829.927206. Which interpretation is accurate?

Correct option: Training MSE rises and validation MSE falls, but degree 6 still generalises very poorly.

Sources: Project1-QuizContext

### 8. Which statement correctly distinguishes the polynomial degree from the regression coefficients?

Correct option: Degree is a hyperparameter selected using validation performance, while coefficients are fitted on training data.

Sources: Project1-QuizContext

### 9. Why was a logarithmic y-axis useful for plotting training and validation MSE across degrees 1–6?

Correct option: It makes errors spanning several orders of magnitude easier to compare without changing the underlying MSE values.

Sources: Project1-QuizContext

### 10. Which comparison correctly connects Project 1 with the red/white wine classification tutorial?

Correct option: Both tune hyperparameters using validation data, but Project 1 evaluates continuous quality predictions using MSE rather than classification accuracy.

Sources: Project1-QuizContext

### 11. The submitted preprocessing called StandardScaler.fit_transform(X) before splitting the data. Explain the limitation and describe how you would correct it in a future implementation.

Expected answer: The scaler learned means and standard deviations using all records, including validation and test records. This leaks holdout information into preprocessing and qualifies the interpretation of the recorded metrics. A corrected implementation would split raw features first, fit scaling only on training data, and use that fitted scaler to transform validation and test data, preferably within a pipeline.

Marking criteria:
- Identifies that validation and test records contributed to the fitted scaling statistics.
- Explains why this is preprocessing leakage.
- Proposes splitting before fitting the scaler.
- Uses training-fitted scaling unchanged on validation and test data.

Sources: Project1-QuizContext

### 12. Walk through how a single degree is evaluated in the polynomial-degree sweep, from the training features to the two recorded MSE values.

Expected answer: For a candidate degree, PolynomialFeatures constructs the expanded training design matrix using fit_transform and applies the same mapping to validation features using transform. LinearRegression fits coefficients using expanded training features and training targets. Predictions are then made for both partitions, compared with their respective targets using MSE, and the paired errors are stored for comparison across degrees.

Marking criteria:
- Describes polynomial expansion of training and validation inputs using the same mapping.
- States that regression coefficients are fitted using training data only.
- Describes predictions and separate MSE calculations for both partitions.
- Explains that the errors are retained for candidate comparison.

Sources: Project1-QuizContext

### 13. Explain the bias–variance interpretation of degree 1, degree 2 and the high-degree models. What limitation applies to claims about bias and variance in this experiment?

Expected answer: Degree 1 is more constrained and is consistent with greater bias relative to degree 2. Degree 2 improves both training and validation errors, suggesting that some nonlinear structure is useful. Higher degrees fit training data more closely overall but exhibit large validation errors, consistent with high variance and overfitting. These are interpretations of one split's error patterns, not direct estimates of bias and variance from repeated datasets.

Marking criteria:
- Connects degree 1's limited flexibility with relatively higher bias.
- Explains degree 2's improvement as evidence of useful additional flexibility.
- Connects high-degree training–validation gaps with variance and overfitting.
- Clarifies that bias and variance were inferred rather than directly measured.

Sources: Project 1 - Wine Quality, polynomial regression and model selection, Project1-QuizContext

### 14. Degree 2 had validation MSE 0.547604 and saved-model test MSE 0.500912. What do these results support, and what do they not establish about deployment?

Expected answer: Degree 2 is justified among the tested candidates because it had the lowest validation MSE. Its reasonably similar test MSE supports performance beyond the coefficient-fitting data under this experiment. However, a single split, together with the preprocessing leakage limitation, does not guarantee future production performance, establish uncertainty bounds, or prove performance on a different population.

Marking criteria:
- Bases the degree-2 recommendation on minimum validation MSE.
- Interprets the test result as supporting rather than conclusive evidence.
- Identifies at least one limitation on deployment claims, such as one split, preprocessing leakage or population differences.

Sources: Project1-QuizContext

### 15. A colleague wants to send raw chemical measurements directly to predict_quality. Explain why this is unsafe for the submitted artifact and propose a more portable saved pipeline for a future version.

Expected answer: The submitted artifact contains PolynomialFeatures and LinearRegression but not StandardScaler. Raw inputs would therefore be expanded and evaluated on a scale different from training. The current caller must supply features transformed using the original scaling statistics and in the same column order. A future version could save a fitted StandardScaler → PolynomialFeatures(degree=2) → LinearRegression pipeline, trained on raw training features, so it accepts consistently ordered raw inputs.

Marking criteria:
- Identifies that StandardScaler is absent from the submitted artifact.
- Explains the mismatch caused by passing raw measurements.
- States the need for consistent scaling statistics and feature order.
- Proposes including fitted scaling in a future saved pipeline without claiming it was submitted.

Sources: Project1-QuizContext

### 16. For two original predictors x1 and x2, describe the features created by degree-2 polynomial expansion and explain how an interaction term differs from a squared term.

Expected answer: With the default bias term, the expanded representation contains 1, x1, x2, x1², x1*x2 and x2². A squared term represents curvature associated with one predictor, whereas the interaction term allows the contribution of one predictor to depend on the value of the other.

Marking criteria:
- Includes the original predictors and their squared terms.
- Includes the x1*x2 interaction and the default constant feature.
- Distinguishes single-variable curvature from cross-variable interaction.

Sources: Project1-QuizContext

### 17. Explain what StandardScaler computes for each feature and why this can help polynomial regression. Does standardisation by itself prevent overfitting?

Expected answer: StandardScaler subtracts a feature's fitted mean and divides by its fitted standard deviation, producing z-scores. This places measurements with different units and scales on comparable scales and can improve numerical conditioning when polynomial terms are constructed. It does not reduce model flexibility by itself or guarantee protection from overfitting.

Marking criteria:
- Describes the transformation as (x − mean) / standard deviation.
- Explains comparable scales or improved numerical conditioning.
- States that standardisation alone does not prevent overfitting.

Sources: Project1-QuizContext

### 18. After selecting degree 2, which data were used to fit the submitted final artifact? Explain how a hypothetical train-plus-validation refit would differ and what role the test set should retain.

Expected answer: The submitted final pipeline was fitted on X_train and y_train only. A hypothetical refit would keep the selected degree fixed and re-estimate the model using the combined training and validation records. The test set should remain excluded from fitting and degree selection and be used for final assessment rather than repeated tuning.

Marking criteria:
- Correctly states that the submitted artifact used training data only.
- Describes train-plus-validation refitting as a hypothetical later step with degree fixed.
- Preserves the test set's role as an independent final assessment.

Sources: Project1-QuizContext

### 19. Compare the Week 1 one-nearest-neighbour quality predictor with Project 1's polynomial regression. How do they generate predictions, and why can MSE evaluate both?

Expected answer: One-nearest-neighbour finds the closest stored training observation in feature space and uses its target value. Polynomial regression transforms inputs into polynomial features and uses coefficients learned from training data to compute a prediction. Although the algorithms differ, both produce numerical quality predictions that can be compared with true numerical scores using mean squared error.

Marking criteria:
- Explains prediction using the closest training observation for 1-NN.
- Explains prediction using learned coefficients on polynomial features.
- Justifies MSE through the shared numerical quality target.

Sources: Project1-QuizContext

### 20. Explain why quality and wine_type were removed from the predictor table, and describe how using quality as an input would undermine this prediction task.

Expected answer: Quality is the numerical target and must be separated from the predictors; including it would reveal the answer during prediction and create target leakage. Wine_type was intentionally excluded from the submitted feature set, leaving 11 numerical chemical or physical predictors. Its exclusion was a project implementation choice, not a general rule that wine type could never be a predictor.

Marking criteria:
- Identifies quality as the numerical prediction target.
- Explains that using quality as a predictor would leak the answer.
- Identifies wine_type as intentionally excluded rather than inherently invalid as a predictor.
- Recognises the submitted inputs as 11 numerical chemical or physical features.

Sources: Project1-QuizContext
