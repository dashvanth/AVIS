import unittest
import pandas as pd
import numpy as np
from unittest.mock import patch, MagicMock
from app.services.issue_detection import calculate_health_score
from app.services.confidence_engine import calculate_repair_confidence
from app.services.repair_engine import get_df_stats, simulate_repair

class TestBackendAlgorithms(unittest.TestCase):
    def setUp(self):
        # Create a synthetic dataset
        np.random.seed(42)
        self.df = pd.DataFrame({
            "age": [25, 30, np.nan, 35, 40, 25, 120],  # NaN, outlier (120), duplicate (25)
            "salary": [50000, 60000, 55000, np.nan, 70000, 50000, 200000], # NaN, outlier (200k), duplicate (50k)
            "department": ["IT", "HR", "IT", "HR", "Finance", "IT", "IT"],
            "remote": [True, False, True, False, True, True, True]
        })

    def test_health_score(self):
        # Base 100, drops by:
        # missing: 10% * 40 = 4
        # duplicate: 20% * 20 = 4
        # outlier: 10% * 20 = 2
        # type_error: 0% = 0
        # Expected: 100 - 4 - 4 - 2 = 90
        score = calculate_health_score(0.1, 0.2, 0.1, 0.0)
        self.assertEqual(score, 90)
        
        # Test boundaries
        bad_score = calculate_health_score(1.0, 1.0, 1.0, 1.0)
        self.assertEqual(bad_score, 0)
        
        perfect_score = calculate_health_score(0.0, 0.0, 0.0, 0.0)
        self.assertEqual(perfect_score, 100)

    def test_df_stats(self):
        stats = get_df_stats(self.df, "age")
        self.assertEqual(stats["missing"], 1)
        self.assertAlmostEqual(stats["median"], 32.5) # [25, 25, 30, 35, 40, 120] -> mid is 32.5
        # 1 / 7 rows has missing age
        # Wait, total cells = 7 * 4 = 28. missing = 2. missing_ratio = 2/28.
        self.assertIsNotNone(stats["health_score"])

    def test_confidence_engine(self):
        # Missing numeric -> mean/median
        conf_mean = calculate_repair_confidence("age", "Missing Values", self.df, "Mean Imputation")
        conf_median = calculate_repair_confidence("age", "Missing Values", self.df, "Median Imputation")
        
        # Because age has a massive outlier (120), it should be severely skewed. 
        # Mean confidence should be lower than Median.
        self.assertGreater(conf_median, conf_mean)
        
        # Missing categorical -> mode
        conf_mode = calculate_repair_confidence("department", "Missing Values", self.df, "Mode Replacement")
        self.assertGreater(conf_mode, 0.4)
        
        # Duplicates
        conf_dup = calculate_repair_confidence("Entire Dataset", "Duplicate Rows", self.df, "Duplicate Removal")
        self.assertEqual(conf_dup, 0.95)

    @patch('app.services.repair_engine.get_dataframe')
    def test_simulate_mean_imputation(self, mock_get_df):
        mock_get_df.return_value = self.df
        # Create a mock session
        mock_session = MagicMock()
        
        # Apply mean imputation
        result = simulate_repair(1, "age", "Mean Imputation", mock_session)
        
        self.assertEqual(result["column"], "age")
        self.assertEqual(result["missing_before"], 1)
        self.assertEqual(result["missing_after"], 0)
        
        # Original non-null ages: 25, 30, 35, 40, 25, 120 -> sums to 275. 275 / 6 = 45.83
        self.assertAlmostEqual(result["mean_after"], 45.83, places=1)

    @patch('app.services.repair_engine.get_dataframe')
    def test_simulate_duplicate_removal(self, mock_get_df):
        # Add exact duplicate row
        df_duped = pd.concat([self.df, self.df.iloc[[0]]], ignore_index=True)
        mock_get_df.return_value = df_duped
        mock_session = MagicMock()
        
        result = simulate_repair(1, "Entire Dataset", "Duplicate Removal", mock_session)
        
        self.assertEqual(result["row_count_before"], 8)
        self.assertEqual(result["row_count_after"], 6) # Removed the original duplicates (index 0 and index 5 are identical in columns... wait are they?)
        # Let's check: 0: 25, 50k, IT, True. 5: 25, 50k, IT, True. Yes! So duplicate drop should drop one of them, plus the concat one.

    @patch('app.services.repair_engine.get_dataframe')
    def test_simulate_outlier_removal(self, mock_get_df):
        mock_get_df.return_value = self.df
        mock_session = MagicMock()
        
        result = simulate_repair(1, "age", "Outlier Removal", mock_session)
        
        # 120 is an outlier. Initial len = 7. Missing is not dropped by outlier removal unless it breaks IQR.
        # Actually pandas quantile drops NA silently. 
        # Q1=25, Q3=38.75. IQR=13.75. 1.5*IQR = 20.625. Limits: 4.375 to 59.375.
        # 120 is out. So row count after should be 6 (or less if the NA drops).
        # In the engine: df_copy = df_copy[~((df_copy[column] < ...) | (df_copy[column] > ...))]
        # NaN returns false for < and >, so the mask is false, ~mask is True. The NaN row stays!
        self.assertEqual(result["row_count_before"], 7)
        self.assertEqual(result["row_count_after"], 6)

if __name__ == '__main__':
    unittest.main()
