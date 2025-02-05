import React, { useState } from 'react';
import styles from './ProductFilter.module.css';

const ProductFilter = ({ categories, onFilterUpdate }) => {
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [selectedCategories, setSelectedCategories] = useState([]);

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        const numValue = value === '' ? '' : Number(value);
        
        setPriceRange(prev => {
            const newRange = { ...prev, [name]: numValue };
            // Ensure min doesn't exceed max and max isn't less than min
            if (name === 'min' && numValue > prev.max) {
                newRange.max = numValue;
            } else if (name === 'max' && numValue < prev.min) {
                newRange.min = numValue;
            }
            return newRange;
        });
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategories(prev => 
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleApply = () => {
        const filters = {
            priceRange: {
                min: priceRange.min || 0,
                max: priceRange.max || 1000
            },
            categories: selectedCategories
        };
        onFilterUpdate(filters);
    };

    const handleReset = () => {
        setPriceRange({ min: 0, max: 1000 });
        setSelectedCategories([]);
        onFilterUpdate({
            priceRange: { min: 0, max: 1000 },
            categories: []
        });
    };

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterGroup}>
                <h3 className={styles.filterTitle}>Price Range</h3>
                <div className={styles.priceInputs}>
                    <input
                        type="number"
                        name="min"
                        value={priceRange.min}
                        onChange={handlePriceChange}
                        placeholder="Min"
                        min="0"
                        className={styles.input}
                    />
                    <input
                        type="number"
                        name="max"
                        value={priceRange.max}
                        onChange={handlePriceChange}
                        placeholder="Max"
                        min={priceRange.min}
                        className={styles.input}
                    />
                </div>
            </div>

            <div className={styles.filterGroup}>
                <h3 className={styles.filterTitle}>Categories</h3>
                <div className={styles.categoryList}>
                    {categories.map(category => (
                        <label key={category} className={styles.categoryLabel}>
                            <input
                                type="checkbox"
                                value={category}
                                checked={selectedCategories.includes(category)}
                                onChange={handleCategoryChange}
                                className={styles.checkbox}
                            />
                            {category}
                        </label>
                    ))}
                </div>
            </div>

            <div className={styles.buttonGroup}>
                <button 
                    className={styles.applyButton}
                    onClick={handleApply}
                >
                    Apply Filters
                </button>
                <button 
                    className={styles.resetButton}
                    onClick={handleReset}
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
};

export default ProductFilter;