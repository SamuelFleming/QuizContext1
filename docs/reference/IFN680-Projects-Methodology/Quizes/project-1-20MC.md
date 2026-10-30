# Project 1 - Wine Quality, polynomial regression and model selection

Scope: Project 1 - Wine Quality, polynomial regression and model selection
Mode: Targeted
Difficulty: medium
Questions: 20 multiple choice, 0 short answer
Created: 2026-10-17T11:03:18.300Z

## Questions

### 1. Which variable does Project 1 predict, and what makes this a regression task?

- The red-or-white wine type
- The continuous numerical quality score
- The polynomial degree selected for the model
- Whether a wine contains missing values

### 2. What was the overall allocation of records to training, validation, and test sets?

- 60% training, 20% validation, 20% test
- 50% training, 25% validation, 25% test
- 80% training, 10% validation, 10% test
- 70% training, 15% validation, 15% test

### 3. How was the polynomial degree selected in the project?

- Choose the degree with the lowest validation MSE among degrees 1–6
- Choose the degree with the lowest training MSE among degrees 1–6
- Choose the degree that produces the fewest polynomial features
- Choose the degree with the highest test MSE among degrees 1–6

### 4. Which result identifies degree 2 as the selected model?

- It had the lowest training MSE, 0.063852
- It had the lowest test MSE of all six candidate degrees
- It had equal training and validation MSE
- It had the lowest validation MSE, 0.547604

### 5. What happened when the candidate degree increased from 2 to 3?

- Training MSE rose while validation MSE fell to its minimum
- Both training and validation MSE rose above 100
- Training MSE fell from 0.479120 to 0.407528, while validation MSE rose from 0.547604 to 0.839361
- Both training and validation MSE fell by similar amounts

### 6. Why is degree 5 a poor choice despite having the lowest training MSE?

- Its validation MSE was the lowest of the six degrees
- It could not produce continuous predictions
- Its training MSE was higher than that of degree 1
- Its validation MSE was extremely high at 114296.332178

### 7. Which statement accurately describes the degree-5-to-degree-6 results?

- Training MSE rose and validation MSE fell, but validation error remained very large
- Both training and validation MSE fell to their lowest values
- Training MSE fell while validation MSE rose to its highest value
- Both errors rose, showing a strictly increasing pattern

### 8. How can polynomial regression be nonlinear in its inputs yet linear in its fitted coefficients?

- It uses nonlinear coefficient updates but keeps every input unchanged
- It predicts by finding the nearest training example rather than fitting coefficients
- It transforms inputs into powers and interactions, then fits a linear combination of those features
- It converts the numerical target into categories before fitting

### 9. With two input variables, which term could be included by a degree-2 polynomial feature transformation?

- The exponential term exp(x1*x2)
- The reciprocal term 1/(x1+x2)
- A term based on the target value y
- The interaction term x1*x2

### 10. In the candidate-degree loop, why does the code call `transform(X_val)` after `fit_transform(X_train)`?

- To choose a different polynomial mapping for each validation row
- To fit the regression coefficients using validation targets
- To standardise the validation set using test-set statistics
- To apply the training-defined polynomial feature mapping to validation rows

### 11. What does mean squared error measure in this regression task?

- The average of squared differences between predicted and true quality scores
- The number of polynomial terms in the model
- The average absolute difference between feature means and zero
- The fraction of wines assigned the correct red-or-white category

### 12. Which description best captures the roles of the training, validation, and test sets?

- Training selects degree, validation estimates coefficients, and test tunes preprocessing
- All three sets are used equally to fit coefficients and select degree
- Training evaluates final performance, validation is used only for scaling, and test fits coefficients
- Training estimates coefficients, validation selects degree, and test evaluates the selected model

### 13. What does the logarithmic y-axis in the error plot change?

- The visual spacing of values, making errors across several orders of magnitude easier to compare
- The underlying MSE values calculated for each degree
- The ranking of models by validation MSE
- The polynomial features generated for each degree

### 14. Which components are inside the saved `best_model.joblib` pipeline?

- StandardScaler, PolynomialFeatures, and LinearRegression
- StandardScaler and PolynomialFeatures only
- PolynomialFeatures and LinearRegression
- The train, validation, and test data along with all six fitted models

### 15. What preprocessing limitation applies when using the saved model to make predictions?

- Inputs must already be scaled with matching statistics and supplied in the same column order
- Inputs must be converted into red-or-white labels before prediction
- The saved model automatically rescales raw inputs using its embedded StandardScaler
- The model accepts only the quality target as an input

### 16. Why is fitting `StandardScaler` on all rows before splitting a limitation?

- It prevents the model from learning regression coefficients
- The scaling statistics use information from validation and test rows
- It makes the target variable categorical
- It ensures that training and validation rows are identical

### 17. What does the submitted code do after selecting the best degree when fitting the saved final model?

- Fits a separate model on the test set
- Fits the selected pipeline on the training set only
- Fits all six degrees on the validation set and saves them together
- Refits the selected pipeline on the combined training and validation sets

### 18. What is the reported MSE for the saved selected model on the held-out test set?

- 0.500912
- 0.547604
- 0.839361
- 0.063852

### 19. What is the main purpose of standardising the input features in this project?

- To put features measured in different units on comparable scales
- To directly prevent polynomial models from overfitting
- To remove the need for a validation set
- To convert the continuous quality target into a binary class

### 20. Which comparison correctly distinguishes Project 1 from the wine classification task in the second tutorial?

- Project 1 predicts numerical quality and uses MSE; the tutorial predicts wine type and uses classification metrics such as accuracy
- Both tasks predict continuous quality scores and use MSE
- Project 1 predicts wine type using accuracy; the tutorial predicts quality using MSE
- Both tasks predict wine type and use confusion matrices

## Answer key

### 1. Which variable does Project 1 predict, and what makes this a regression task?

Correct option: The continuous numerical quality score

Sources: Project 1 - Wine Quality, polynomial regression and model selection, Project1-QuizContext

### 2. What was the overall allocation of records to training, validation, and test sets?

Correct option: 60% training, 20% validation, 20% test

Sources: Project1-QuizContext

### 3. How was the polynomial degree selected in the project?

Correct option: Choose the degree with the lowest validation MSE among degrees 1–6

Sources: Project 1 - Wine Quality, polynomial regression and model selection, Project1-QuizContext

### 4. Which result identifies degree 2 as the selected model?

Correct option: It had the lowest validation MSE, 0.547604

Sources: Project1-QuizContext

### 5. What happened when the candidate degree increased from 2 to 3?

Correct option: Training MSE fell from 0.479120 to 0.407528, while validation MSE rose from 0.547604 to 0.839361

Sources: Project1-QuizContext

### 6. Why is degree 5 a poor choice despite having the lowest training MSE?

Correct option: Its validation MSE was extremely high at 114296.332178

Sources: Project1-QuizContext

### 7. Which statement accurately describes the degree-5-to-degree-6 results?

Correct option: Training MSE rose and validation MSE fell, but validation error remained very large

Sources: Project1-QuizContext

### 8. How can polynomial regression be nonlinear in its inputs yet linear in its fitted coefficients?

Correct option: It transforms inputs into powers and interactions, then fits a linear combination of those features

Sources: Project1-QuizContext

### 9. With two input variables, which term could be included by a degree-2 polynomial feature transformation?

Correct option: The interaction term x1*x2

Sources: Project1-QuizContext

### 10. In the candidate-degree loop, why does the code call `transform(X_val)` after `fit_transform(X_train)`?

Correct option: To apply the training-defined polynomial feature mapping to validation rows

Sources: Project1-QuizContext

### 11. What does mean squared error measure in this regression task?

Correct option: The average of squared differences between predicted and true quality scores

Sources: Project1-QuizContext

### 12. Which description best captures the roles of the training, validation, and test sets?

Correct option: Training estimates coefficients, validation selects degree, and test evaluates the selected model

Sources: Project1-QuizContext

### 13. What does the logarithmic y-axis in the error plot change?

Correct option: The visual spacing of values, making errors across several orders of magnitude easier to compare

Sources: Project1-QuizContext

### 14. Which components are inside the saved `best_model.joblib` pipeline?

Correct option: PolynomialFeatures and LinearRegression

Sources: Project1-QuizContext

### 15. What preprocessing limitation applies when using the saved model to make predictions?

Correct option: Inputs must already be scaled with matching statistics and supplied in the same column order

Sources: Project1-QuizContext

### 16. Why is fitting `StandardScaler` on all rows before splitting a limitation?

Correct option: The scaling statistics use information from validation and test rows

Sources: Project1-QuizContext

### 17. What does the submitted code do after selecting the best degree when fitting the saved final model?

Correct option: Fits the selected pipeline on the training set only

Sources: Project1-QuizContext

### 18. What is the reported MSE for the saved selected model on the held-out test set?

Correct option: 0.500912

Sources: Project1-QuizContext

### 19. What is the main purpose of standardising the input features in this project?

Correct option: To put features measured in different units on comparable scales

Sources: Project1-QuizContext

### 20. Which comparison correctly distinguishes Project 1 from the wine classification task in the second tutorial?

Correct option: Project 1 predicts numerical quality and uses MSE; the tutorial predicts wine type and uses classification metrics such as accuracy

Sources: Project1-QuizContext
