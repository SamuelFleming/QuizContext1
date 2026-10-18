# Project 1 - 10-10 w/ Instructions (Stage 3)

Scope: Project 1 - Wine Quality, polynomial regression and model selection
Mode: Targeted
Difficulty: medium
Questions: 10 multiple choice, 10 short answer
Created: 2026-10-18T04:45:11.825Z

## Questions

### 1. The code first reserves 20% of the data for testing, then reserves 25% of the remaining data for validation. Hypothetically, changing the second test_size to 0.20 would produce which approximate overall training/validation/test proportions?

- 64% training, 16% validation, 20% test
- 60% training, 16% validation, 24% test
- 60% training, 20% validation, 20% test
- 56% training, 24% validation, 20% test

### 2. For two input features x1 and x2, which description correctly explains the submitted PolynomialFeatures(degree=2) transformation?

- It estimates regression coefficients before constructing the feature matrix.
- It produces two predicted quality scores, one for each input feature.
- It includes a constant, the original features, their squares, and x1*x2.
- It replaces the original features with x1² and x2² only.

### 3. Consider the submitted selection code: best_index = val_errors.index(min(val_errors)); best_degree_derived = degrees[best_index]. Why does it select degree 2 rather than degree 5?

- It averages training and validation errors, which makes degree 2 the winner.
- It excludes degrees above 2 before comparing errors.
- It finds the position of the smallest validation error and maps that position to the corresponding degree.
- It identifies the lowest training error, which occurs at degree 2.

### 4. After degree selection, the submitted code creates a new pipeline and calls best_model.fit(X_train, y_train). Which statement accurately describes the saved artifact?

- It contains a polynomial transformer and regression model fitted using training data only.
- It contains an unfitted polynomial transformer and coefficients fitted on test data.
- It contains all six fitted candidate models and selects one during prediction.
- It contains a scaler and a regression model fitted on training plus validation data.

### 5. A colleague proposes checking test MSE for every polynomial degree and choosing the degree with the smallest test MSE. What is the main methodological problem with this hypothetical change?

- Comparing test errors would force all fitted regression coefficients to be identical.
- MSE can only be calculated on training and validation data.
- Polynomial regression cannot calculate predictions for more than one test set.
- The test set would become part of model selection rather than an independent final evaluation.

### 6. From degree 5 to degree 6, training MSE rises from about 0.064 to 0.203, while validation MSE falls from about 114,296 to 6,830. Which interpretation is best supported?

- Degree 6 resolves overfitting because its validation error is lower than degree 5's.
- Neither error sequence is strictly monotonic, and degree 6 still generalises very poorly.
- Degree 6 should replace degree 2 because its training error is smaller.
- The results establish that validation error always falls as degree increases.

### 7. What does plt.yscale('log') accomplish in the report's training/validation error plot?

- It reduces the fitted models' large prediction errors before evaluation.
- It makes errors spanning many orders of magnitude easier to view without changing the calculated MSE values.
- It changes the selected degree by assigning less importance to large validation errors.
- It replaces MSE with the mean logarithm of the prediction errors.

### 8. Suppose two predictions have residual magnitudes of 1 and 3 quality-score units. How do their individual contributions to MSE compare?

- The larger residual contributes six times as much.
- The larger residual contributes three times as much.
- They contribute equally because both are single observations.
- The larger residual contributes nine times as much.

### 9. A deployment script fits a fresh StandardScaler on each incoming batch before calling predict_quality. Why is this not equivalent to the submitted model's expected preprocessing?

- The saved pipeline already scales each batch, so this would always standardise twice.
- Batch-specific scaling changes the input coordinate system instead of reusing the original fitted scaling statistics.
- StandardScaler converts continuous predictors into classification labels.
- PolynomialFeatures requires unscaled inputs and cannot accept standardised values.

### 10. Which adaptation correctly transfers the Week 2 model-selection workflow to this project?

- Use wine_type as the target and select polynomial degree by classification accuracy.
- Select polynomial degree by training accuracy, then report a confusion matrix for quality.
- Sweep polynomial degree using training fits and validation MSE, then evaluate the selected model on the test set.
- Keep the classifier's validation accuracy and change only the name of the target column.

### 11. Walk through the effect of dropna(), drop_duplicates(), and X = wine_df.drop(['wine_type', 'quality'], axis=1). Why would accidentally leaving quality in X undermine the experiment?

Short answer

### 12. An examiner says, 'The validation rows were not used in model.fit, so there was no information leakage.' Explain why this is incomplete for the submitted preprocessing sequence.

Short answer

### 13. In the degree sweep, explain the different roles of poly.fit_transform(X_train), poly.transform(X_val), and model.fit(X_train_poly, y_train). Where are the predictive coefficients actually learned?

Short answer

### 14. An examiner argues that using squared and interaction terms means the submitted model is no longer linear regression. Explain how the model can be nonlinear in its inputs but linear in its parameters.

Short answer

### 15. From degree 2 to degree 3, training MSE falls from about 0.479 to 0.408 while validation MSE rises from about 0.548 to 0.839. Explain what this suggests and what it does not establish about bias and variance.

Short answer

### 16. Walk through what happens when predict_quality(X_normed_features) is called. What must the caller guarantee about the input, and what does the saved artifact not guarantee?

Short answer

### 17. Hypothetically, you replace the saved model with make_pipeline(StandardScaler(), PolynomialFeatures(degree=2), LinearRegression()). Explain how fitting and evaluation would need to change so this actually fixes the preprocessing problem.

Short answer

### 18. The selected model's test MSE was about 0.501, compared with validation MSE of about 0.548. Justify a cautious interpretation rather than claiming that the model is guaranteed to perform this well in production.

Short answer

### 19. A proposed follow-up is to refit the selected degree-2 architecture on training plus validation data. Explain how this differs from the submitted final fit and how the test set should be handled.

Short answer

### 20. Suppose you wanted to investigate whether regularisation could make higher-degree models more stable. Explain why Ridge regression would be a reasonable hypothetical experiment and how you would evaluate it without claiming it was part of the submission.

Short answer

## Answer key

### 1. The code first reserves 20% of the data for testing, then reserves 25% of the remaining data for validation. Hypothetically, changing the second test_size to 0.20 would produce which approximate overall training/validation/test proportions?

Correct option: 64% training, 16% validation, 20% test

Sources: Project1-QuizContext

### 2. For two input features x1 and x2, which description correctly explains the submitted PolynomialFeatures(degree=2) transformation?

Correct option: It includes a constant, the original features, their squares, and x1*x2.

Sources: Project1-QuizContext

### 3. Consider the submitted selection code: best_index = val_errors.index(min(val_errors)); best_degree_derived = degrees[best_index]. Why does it select degree 2 rather than degree 5?

Correct option: It finds the position of the smallest validation error and maps that position to the corresponding degree.

Sources: Project1-QuizContext

### 4. After degree selection, the submitted code creates a new pipeline and calls best_model.fit(X_train, y_train). Which statement accurately describes the saved artifact?

Correct option: It contains a polynomial transformer and regression model fitted using training data only.

Sources: Project1-QuizContext

### 5. A colleague proposes checking test MSE for every polynomial degree and choosing the degree with the smallest test MSE. What is the main methodological problem with this hypothetical change?

Correct option: The test set would become part of model selection rather than an independent final evaluation.

Sources: Project1-QuizContext

### 6. From degree 5 to degree 6, training MSE rises from about 0.064 to 0.203, while validation MSE falls from about 114,296 to 6,830. Which interpretation is best supported?

Correct option: Neither error sequence is strictly monotonic, and degree 6 still generalises very poorly.

Sources: Project1-QuizContext

### 7. What does plt.yscale('log') accomplish in the report's training/validation error plot?

Correct option: It makes errors spanning many orders of magnitude easier to view without changing the calculated MSE values.

Sources: Project1-QuizContext

### 8. Suppose two predictions have residual magnitudes of 1 and 3 quality-score units. How do their individual contributions to MSE compare?

Correct option: The larger residual contributes nine times as much.

Sources: Project1-QuizContext

### 9. A deployment script fits a fresh StandardScaler on each incoming batch before calling predict_quality. Why is this not equivalent to the submitted model's expected preprocessing?

Correct option: Batch-specific scaling changes the input coordinate system instead of reusing the original fitted scaling statistics.

Sources: Project1-QuizContext

### 10. Which adaptation correctly transfers the Week 2 model-selection workflow to this project?

Correct option: Sweep polynomial degree using training fits and validation MSE, then evaluate the selected model on the test set.

Sources: Project1-QuizContext

### 11. Walk through the effect of dropna(), drop_duplicates(), and X = wine_df.drop(['wine_type', 'quality'], axis=1). Why would accidentally leaving quality in X undermine the experiment?

Expected answer: The cleaning calls remove rows containing missing values and duplicate rows. The feature matrix excludes wine_type and the quality target, leaving 11 numerical predictors. Leaving quality among the predictors would expose the answer to the model, making apparent performance misleading rather than demonstrating prediction from wine characteristics.

Marking criteria:
- Explains the distinct purposes of removing missing rows and duplicate rows.
- Identifies quality as the target and wine_type as excluded from the submitted predictors.
- Explains why including the target among predictors creates leakage.

Sources: Project1-QuizContext

### 12. An examiner says, 'The validation rows were not used in model.fit, so there was no information leakage.' Explain why this is incomplete for the submitted preprocessing sequence.

Expected answer: Although regression coefficients were fitted on training rows, StandardScaler.fit_transform(X) ran before splitting. Its means and standard deviations therefore incorporated validation and test inputs. This is leakage through preprocessing, even without using their target values. A corrected workflow would split first and learn scaling statistics only from the training partition.

Marking criteria:
- Identifies that scaling was fitted before the splits.
- Explains that holdout feature values influenced the fitted means and standard deviations.
- Distinguishes preprocessing leakage from fitting coefficients on holdout labels.
- Describes splitting first and fitting the scaler only on training data as a hypothetical correction.

Sources: Project1-QuizContext

### 13. In the degree sweep, explain the different roles of poly.fit_transform(X_train), poly.transform(X_val), and model.fit(X_train_poly, y_train). Where are the predictive coefficients actually learned?

Expected answer: The first call configures the polynomial feature mapping and constructs the expanded training matrix. The second applies that same mapping to validation rows so the columns have the same meaning and order. LinearRegression.fit then learns the predictive coefficients from the expanded training matrix and training targets. PolynomialFeatures does not learn the quality-prediction coefficients.

Marking criteria:
- Explains that fit_transform constructs the expanded training representation.
- Explains that transform applies the consistent mapping to validation data.
- Identifies LinearRegression.fit as the step that learns coefficients using y_train.

Sources: Project1-QuizContext

### 14. An examiner argues that using squared and interaction terms means the submitted model is no longer linear regression. Explain how the model can be nonlinear in its inputs but linear in its parameters.

Expected answer: PolynomialFeatures creates nonlinear functions of the original inputs, such as x1² and x1*x2. LinearRegression then forms a weighted sum of these fixed transformed features. The coefficients appear only to the first power and are not multiplied together, so the model remains linear in its fitted parameters even though its prediction surface can be curved in the original input space.

Marking criteria:
- Gives an example of a nonlinear transformed input feature.
- Explains prediction as a weighted sum of transformed features.
- Distinguishes nonlinear dependence on inputs from linear dependence on coefficients.

Sources: Project1-QuizContext

### 15. From degree 2 to degree 3, training MSE falls from about 0.479 to 0.408 while validation MSE rises from about 0.548 to 0.839. Explain what this suggests and what it does not establish about bias and variance.

Expected answer: The additional flexibility improves fit to the training observations but worsens performance on the validation observations, marking the first clear overfitting pattern in the sweep. This is consistent with increased variance and supports retaining degree 2 among the tested candidates. It is not a direct numerical measurement of bias or variance, because the experiment did not repeatedly fit models across independently sampled datasets.

Marking criteria:
- Connects lower training error to improved fit on the training observations.
- Connects higher validation error to worse generalisation and an overfitting pattern.
- Explains that bias and variance were inferred rather than directly measured.

Sources: Project1-QuizContext

### 16. Walk through what happens when predict_quality(X_normed_features) is called. What must the caller guarantee about the input, and what does the saved artifact not guarantee?

Expected answer: The helper calls load_best_model, which loads best_model.joblib, and then calls the loaded pipeline's predict method. The pipeline expands the supplied features and passes them to the fitted linear regression. The caller must provide the expected predictors in the same column order and scaled using the original fitted statistics. The artifact does not contain StandardScaler and therefore does not automatically convert raw measurements into the expected scaled inputs.

Marking criteria:
- Traces loading the artifact and calling predict.
- Describes polynomial expansion followed by regression prediction.
- States the need for matching feature order and scaling statistics.
- Explicitly identifies the absence of StandardScaler from the saved pipeline.

Sources: Project1-QuizContext

### 17. Hypothetically, you replace the saved model with make_pipeline(StandardScaler(), PolynomialFeatures(degree=2), LinearRegression()). Explain how fitting and evaluation would need to change so this actually fixes the preprocessing problem.

Expected answer: The raw predictors should be split before fitting preprocessing. The pipeline should be fitted on raw training inputs so its scaler learns only training statistics. Validation and test predictions should receive raw inputs and reuse the fitted pipeline without refitting the scaler. Saving this pipeline would bundle preprocessing with prediction. This is a proposed correction, not the submitted implementation.

Marking criteria:
- Requires splitting raw data before fitting the pipeline.
- Explains that the scaler learns its statistics from training inputs only.
- Requires raw holdout inputs to pass through the fitted pipeline without refitting.
- Distinguishes the proposed pipeline from the submitted artifact.

Sources: Project1-QuizContext

### 18. The selected model's test MSE was about 0.501, compared with validation MSE of about 0.548. Justify a cautious interpretation rather than claiming that the model is guaranteed to perform this well in production.

Expected answer: The similar magnitudes provide supporting evidence that degree 2 performed reasonably consistently on these partitions. A lower test error does not prove that test data are always easier or guarantee future performance. Evaluation used one fixed split, and preprocessing statistics included holdout inputs. The results therefore support a limited conclusion about this experiment rather than a guarantee about future populations.

Marking criteria:
- Interprets the test and validation errors as reasonably close supporting evidence.
- Rejects a guarantee of future or production performance.
- Identifies the single-split limitation.
- Recognises that pre-split scaling qualifies the holdout evaluation.

Sources: Project1-QuizContext

### 19. A proposed follow-up is to refit the selected degree-2 architecture on training plus validation data. Explain how this differs from the submitted final fit and how the test set should be handled.

Expected answer: The submitted final pipeline was fitted only on X_train and y_train. After fixing the degree through validation, a follow-up could use the combined training and validation observations to estimate the final model, potentially benefiting from more fitting data. Preprocessing should be fitted consistently on that final fitting partition. The test set should remain excluded from fitting and tuning and be used for final evaluation; the recorded test MSE cannot simply be assumed to apply to the refitted artifact.

Marking criteria:
- States that the submitted final fit used training data only.
- Explains that combined-data refitting occurs after degree selection and uses more fitting observations.
- Keeps test observations out of fitting and hyperparameter selection.
- Recognises that the refitted artifact requires its own evaluation.

Sources: Project1-QuizContext

### 20. Suppose you wanted to investigate whether regularisation could make higher-degree models more stable. Explain why Ridge regression would be a reasonable hypothetical experiment and how you would evaluate it without claiming it was part of the submission.

Expected answer: Higher degrees create many polynomial features and showed large training–validation gaps. Ridge would penalise large coefficients, potentially reducing sensitivity and improving generalisation, although improvement is not guaranteed. A follow-up could tune degree and regularisation strength using validation data or cross-validation, with preprocessing fitted within the training workflow, and reserve the test set for final evaluation. The submitted models used ordinary LinearRegression, not Ridge.

Marking criteria:
- Relates the proposal to the large feature space and observed generalisation failure.
- Explains coefficient shrinkage as the purpose of Ridge regularisation.
- Proposes validation-based or cross-validated tuning while preserving a final test set.
- Clearly labels Ridge as an unimplemented alternative with no guaranteed improvement.

Sources: Project1-QuizContext
