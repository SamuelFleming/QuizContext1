# Project 1 - 20MC with instructions

Scope: Project 1 - Wine Quality, polynomial regression and model selection
Mode: Targeted
Difficulty: medium
Questions: 20 multiple choice, 0 short answer
Created: 2026-10-18T04:41:21.624Z

## Questions

### 1. After polynomial feature expansion, why can ordinary linear regression still be used to fit the model?

- The expanded features may be nonlinear functions of the inputs, while the prediction remains a linear combination of learned coefficients.
- The target becomes linear once interaction terms are added.
- Polynomial expansion converts every input into a categorical variable.
- Linear regression automatically selects the polynomial degree from the training data.

### 2. In the degree sweep, which quantity is a hyperparameter rather than a fitted model parameter?

- The mean squared error calculated on the training set
- The polynomial degree chosen from candidate values using validation performance
- A predicted quality score for one wine
- A regression coefficient estimated from the training data

### 3. Which description best captures the intended roles of the three data partitions in this project?

- Fit coefficients on validation data, choose degree using test data, and report training performance.
- Use training data only for preprocessing, validation data for coefficient fitting, and test data for degree selection.
- Combine all partitions when choosing the degree, then use training MSE as the final evaluation.
- Fit coefficients on training data, choose degree using validation data, and assess the selected model on test data.

### 4. Why was degree 2 selected from the tested polynomial models?

- It guaranteed the lowest error on every future dataset.
- It had the lowest training MSE among degrees 1–6.
- It had the lowest validation MSE among degrees 1–6.
- It was the only degree that produced continuous predictions.

### 5. What pattern in the results first indicates that greater model complexity is no longer improving validation performance?

- From degree 1 to degree 2, both training and validation MSE fall.
- At degree 1, training MSE is lower than validation MSE.
- From degree 5 to degree 6, validation MSE falls while remaining very high.
- From degree 2 to degree 3, training MSE falls while validation MSE rises.

### 6. A learner recommends degree 5 because it has the smallest training MSE. Which is the strongest objection based on the experiment?

- Its validation MSE is extremely large, suggesting poor performance on data not used to fit its coefficients.
- The model should be selected by the test MSE instead of the validation MSE.
- Its training MSE is too small to be a valid regression metric.
- A degree-5 model cannot produce predictions for continuous targets.

### 7. Which statement accurately describes the training-error trend across degrees 1 through 6?

- It stays constant because the same training data are used.
- It falls at every degree without exception.
- It generally falls as degree increases, but rises from degree 5 to degree 6.
- It rises at every degree because higher-degree features are harder to fit.

### 8. Which interpretation of the bias–variance pattern is best supported by the reported train and validation errors?

- High training error at every degree proves that variance is the dominant problem.
- Degree 2 has zero bias and zero variance because it has the lowest validation MSE.
- The limited degree-1 model is consistent with greater bias, while the high-degree validation failures are consistent with increased variance.
- The results directly measure bias and variance separately for each degree.

### 9. Why is mean squared error an appropriate metric for the main prediction task?

- The target is a continuous numerical quality score, and MSE measures squared deviations between predicted and observed scores.
- The target is a red-or-white class, and MSE counts classification accuracy.
- MSE measures how many polynomial features were generated.
- MSE is appropriate because it is unaffected by large prediction errors.

### 10. In the degree-sweep code, why is the validation set passed to `transform` rather than `fit_transform`?

- To apply the feature mapping established for training without fitting a separate mapping on validation data.
- To make the validation MSE equal to the training MSE.
- To select a new polynomial degree independently for each validation row.
- To estimate the regression coefficients using validation examples.

### 11. Suppose someone repeatedly changes the polynomial degree after inspecting test MSE. What is the main consequence?

- The fitted regression coefficients become independent of the training set.
- The validation set is no longer needed because the test set replaces training.
- The test set begins to influence model selection, so it is no longer an independent final check.
- The test MSE automatically becomes an unbiased estimate of future performance.

### 12. Why can increasing polynomial degree make predictions unstable even if it improves fit on training data?

- Higher degrees force every predicted value to equal the training target.
- Higher degrees remove all interactions between input features.
- Higher degrees reduce the number of fitted features and therefore eliminate variance.
- Higher degrees add many flexible terms that can fit peculiarities of the training sample and amplify variation.

### 13. The split procedure first reserves 20% of records for testing, then takes 25% of the remaining records for validation. What overall allocation does this produce?

- 50% training, 30% validation, and 20% test
- 75% training, 5% validation, and 20% test
- 60% training, 20% validation, and 20% test
- 60% training, 25% validation, and 15% test

### 14. The submitted code fitted `StandardScaler` on all rows before splitting. Why is this a limitation?

- The scaler makes polynomial regression impossible to evaluate with MSE.
- The scaling statistics include information from validation and test rows that should have been held out from preprocessing fit.
- Standardisation necessarily changes the quality target into a categorical variable.
- The scaling statistics are learned only from training rows, so the code cannot transform test rows.

### 15. A user passes raw, unscaled features to the submitted saved-model helper. What should they understand about the saved pipeline?

- It accepts raw features because `joblib` automatically restores preprocessing that was not saved.
- It retrains a scaler on each prediction call and therefore accepts any feature order.
- It contains polynomial feature expansion and linear regression, but not the fitted scaler; inputs must be scaled consistently beforehand.
- It contains the scaler but not polynomial feature expansion.

### 16. Which comparison with Tutorial 2 correctly describes the difference in task and evaluation metric?

- Both tasks are classification, but Project 1 uses a larger decision tree.
- Both tasks are regression, but Tutorial 2 uses confusion matrices to estimate MSE.
- Tutorial 2 predicts red or white wine and uses classification metrics; Project 1 predicts numerical quality and uses MSE.
- Tutorial 2 predicts numerical quality with MSE; Project 1 predicts red or white wine with accuracy.

### 17. Which distinction best describes Tutorial 1's 1-nearest-neighbour method versus Project 1's polynomial regression?

- Both methods are identical once the wine features are standardised.
- Polynomial regression predicts only categories, whereas 1-NN predicts only continuous values.
- 1-NN predicts using nearby stored examples, whereas polynomial regression learns coefficients for expanded features.
- 1-NN learns polynomial coefficients, whereas polynomial regression stores every training example for distance lookup.

### 18. What does plotting MSE on a logarithmic vertical axis change?

- The visual spacing of error values, making results across orders of magnitude easier to compare; it does not change the MSE values.
- The selected degree, because a logarithmic axis always favours simpler models.
- The training predictions, because the chart rescales the model outputs.
- The underlying MSE values, converting large errors into smaller errors.

### 19. The selected model's test MSE is close to its validation MSE. What is the most careful interpretation?

- It is supporting evidence that the selected model performed similarly on these held-out partitions, but it does not guarantee future performance.
- It establishes that there is no preprocessing leakage or other limitation.
- It proves that the model will have the same error on every future wine sample.
- It shows that the validation set was used to fit the model coefficients.

### 20. What is the principal purpose of standardising input features in this project?

- To make the target quality scores binary.
- To put features with different units and scales on comparable scales and potentially improve numerical conditioning.
- To ensure validation MSE is lower than training MSE.
- To guarantee that a high-degree polynomial model cannot overfit.

## Answer key

### 1. After polynomial feature expansion, why can ordinary linear regression still be used to fit the model?

Correct option: The expanded features may be nonlinear functions of the inputs, while the prediction remains a linear combination of learned coefficients.

Sources: Project1-QuizContext

### 2. In the degree sweep, which quantity is a hyperparameter rather than a fitted model parameter?

Correct option: The polynomial degree chosen from candidate values using validation performance

Sources: Project1-QuizContext

### 3. Which description best captures the intended roles of the three data partitions in this project?

Correct option: Fit coefficients on training data, choose degree using validation data, and assess the selected model on test data.

Sources: Project1-QuizContext

### 4. Why was degree 2 selected from the tested polynomial models?

Correct option: It had the lowest validation MSE among degrees 1–6.

Sources: Project 1 - Wine Quality, polynomial regression and model selection, Project1-QuizContext

### 5. What pattern in the results first indicates that greater model complexity is no longer improving validation performance?

Correct option: From degree 2 to degree 3, training MSE falls while validation MSE rises.

Sources: Project1-QuizContext

### 6. A learner recommends degree 5 because it has the smallest training MSE. Which is the strongest objection based on the experiment?

Correct option: Its validation MSE is extremely large, suggesting poor performance on data not used to fit its coefficients.

Sources: Project1-QuizContext

### 7. Which statement accurately describes the training-error trend across degrees 1 through 6?

Correct option: It generally falls as degree increases, but rises from degree 5 to degree 6.

Sources: Project1-QuizContext

### 8. Which interpretation of the bias–variance pattern is best supported by the reported train and validation errors?

Correct option: The limited degree-1 model is consistent with greater bias, while the high-degree validation failures are consistent with increased variance.

Sources: Project1-QuizContext

### 9. Why is mean squared error an appropriate metric for the main prediction task?

Correct option: The target is a continuous numerical quality score, and MSE measures squared deviations between predicted and observed scores.

Sources: Project1-QuizContext

### 10. In the degree-sweep code, why is the validation set passed to `transform` rather than `fit_transform`?

Correct option: To apply the feature mapping established for training without fitting a separate mapping on validation data.

Sources: Project1-QuizContext

### 11. Suppose someone repeatedly changes the polynomial degree after inspecting test MSE. What is the main consequence?

Correct option: The test set begins to influence model selection, so it is no longer an independent final check.

Sources: Project1-QuizContext

### 12. Why can increasing polynomial degree make predictions unstable even if it improves fit on training data?

Correct option: Higher degrees add many flexible terms that can fit peculiarities of the training sample and amplify variation.

Sources: Project1-QuizContext

### 13. The split procedure first reserves 20% of records for testing, then takes 25% of the remaining records for validation. What overall allocation does this produce?

Correct option: 60% training, 20% validation, and 20% test

Sources: Project1-QuizContext

### 14. The submitted code fitted `StandardScaler` on all rows before splitting. Why is this a limitation?

Correct option: The scaling statistics include information from validation and test rows that should have been held out from preprocessing fit.

Sources: Project1-QuizContext

### 15. A user passes raw, unscaled features to the submitted saved-model helper. What should they understand about the saved pipeline?

Correct option: It contains polynomial feature expansion and linear regression, but not the fitted scaler; inputs must be scaled consistently beforehand.

Sources: Project1-QuizContext

### 16. Which comparison with Tutorial 2 correctly describes the difference in task and evaluation metric?

Correct option: Tutorial 2 predicts red or white wine and uses classification metrics; Project 1 predicts numerical quality and uses MSE.

Sources: Project1-QuizContext

### 17. Which distinction best describes Tutorial 1's 1-nearest-neighbour method versus Project 1's polynomial regression?

Correct option: 1-NN predicts using nearby stored examples, whereas polynomial regression learns coefficients for expanded features.

Sources: Project1-QuizContext

### 18. What does plotting MSE on a logarithmic vertical axis change?

Correct option: The visual spacing of error values, making results across orders of magnitude easier to compare; it does not change the MSE values.

Sources: Project1-QuizContext

### 19. The selected model's test MSE is close to its validation MSE. What is the most careful interpretation?

Correct option: It is supporting evidence that the selected model performed similarly on these held-out partitions, but it does not guarantee future performance.

Sources: Project1-QuizContext

### 20. What is the principal purpose of standardising input features in this project?

Correct option: To put features with different units and scales on comparable scales and potentially improve numerical conditioning.

Sources: Project1-QuizContext
