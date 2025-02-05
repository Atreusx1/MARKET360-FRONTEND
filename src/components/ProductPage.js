import React, { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, toggleDislike, toggleLike } from '../services/api';
import styles from './ProductPage.module.css';
import ProductFilter from './ProductFilter';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const initialPriceRange = { min: 0, max: 1000 };

const ProductPage = ({ showModal, setShowModal }) => {
  const [products, setProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newProduct, setNewProduct] = useState({
    dealUrl: '',
    title: '',
    salePrice: '',
    listPrice: '',
    description: '',
    category: '',
    store: '',
    images: []
  });
  const [imagesPreview, setImagesPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Books', 
    'Sports & Outdoors', 'Toys & Games', 'Beauty', 'Automotive'
  ];

  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    categories: []
});
  // Set current user on mount
  useEffect(() => {
    setCurrentUser({ _id: 'user123', name: 'Test User' });
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const queryFilters = {
                minPrice: filters.priceRange.min,
                maxPrice: filters.priceRange.max,
                categories: filters.categories.length > 0 
                    ? filters.categories 
                    : undefined
            };

            const data = await getProducts(queryFilters);
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
        }
    };

    fetchProducts();
}, [filters]);

const handleFilterUpdate = (newFilters) => {
    setFilters(newFilters);
};

  // Handle like/dislike functionality
  const handleLike = useCallback(async (productId) => {
    try {
      if (!currentUser) {
        toast.error('Please login to like products');
        return;
      }

      const response = await toggleLike(productId, {
        action: 'like',
        userId: currentUser._id
      });

      setProducts(products.map(product => {
        if (product._id === productId) {
          return {
            ...product,
            likeCount: response.likeCount,
            dislikeCount: response.dislikeCount
          };
        }
        return product;
      }));
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like status');
    }
  }, [currentUser, products]);

  const handleDislike = useCallback(async (productId) => {
    try {
      if (!currentUser) {
        toast.error('Please login to dislike products');
        return;
      }

      const response = await toggleDislike(productId, {
        action: 'dislike',
        userId: currentUser._id
      });

      setProducts(products.map(product => {
        if (product._id === productId) {
          return {
            ...product,
            likeCount: response.likeCount,
            dislikeCount: response.dislikeCount
          };
        }
        return product;
      }));
    } catch (error) {
      console.error('Error updating dislike:', error);
      toast.error('Failed to update dislike status');
    }
  }, [currentUser, products]);

  const handleShareProduct = async (productId) => {
    const shareUrl = `${window.location.origin}/products/${productId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing product:', error);
      // Fallback
      const tempInput = document.createElement('input');
      document.body.appendChild(tempInput);
      tempInput.value = shareUrl;
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      toast.success('Link copied to clipboard!');
    }
  };

  // Handle image upload
  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size exceeds 5MB limit');
        continue;
      }
      newImages.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
    setImagesPreview(prev => [...prev, ...newPreviews]);
  }, []);

  const removeImage = useCallback((index) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    URL.revokeObjectURL(imagesPreview[index]);
    setImagesPreview(prev => prev.filter((_, i) => i !== index));
  }, [imagesPreview]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadError(null);

    const formData = new FormData();
    Object.keys(newProduct).forEach(key => {
      if (key !== 'images') {
        formData.append(key, newProduct[key]);
      }
    });

    newProduct.images.forEach(file => {
      formData.append('images[]', file);
    });

    try {
      await createProduct(formData);
      toast.success('Product created successfully');
      setShowModal(false);
      setNewProduct({
        dealUrl: '',
        title: '',
        salePrice: '',
        listPrice: '',
        description: '',
        category: '',
        store: '',
        images: []
      });
      setImagesPreview([]);

      // Refresh products
      const data = await getProducts({});
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error creating product:', error);
      setUploadError(error.response?.data?.message || 'Failed to create product');
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Modal Component */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Add New Deal</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {/* Form inputs remain the same as your new version */}
              {/* ... */}
            </form>
          </div>
        </div>
      )}

      <div className={styles.contentWrapper}>
        <div className={styles.filterSidebar}>
        <ProductFilter 
                        categories={categories}
                        onFilterUpdate={handleFilterUpdate}
                    />
        </div>
        <div className={styles.productsGrid}>
          {Array.isArray(products) && products.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.productImage}>
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0].url} alt={product.title} />
                ) : (
                  <img src="/placeholder-image.jpg" alt={product.title} />
                )}
              </div>
              <div className={styles.productInfo}>
                <h3>{product.title}</h3>
                <div className={styles.priceInfo}>
                  <span className={styles.salePrice}>${product.salePrice}</span>
                  <span className={styles.listPrice}>${product.listPrice}</span>
                  <span className={styles.discount}>
                    {Math.round(((product.listPrice - product.salePrice) / product.listPrice) * 100)}% OFF
                  </span>
                </div>
                <p className={styles.store}>From: {product.store}</p>
                <div className={styles.actions}>
                  <Link
                    to={`/products/${product._id}`}
                    className={styles.viewDetailsButton}
                  >
                    View Details
                  </Link>
                  <a
                    href={product.dealUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.dealLink}
                  >
                    View Deal
                  </a>
                  <button 
                    onClick={() => handleShareProduct(product._id)}
                    className={styles.shareButton}
                  >
                    🔗 Share
                  </button>
                  <div className={styles.ratingButtons}>
                    <button 
                      onClick={() => handleLike(product._id)}
                      className={`${styles.likeButton} ${product.likes?.includes(currentUser?._id) ? styles.active : ''}`}
                    >
                      👍 {product.likeCount || 0}
                    </button>
                    <button 
                      onClick={() => handleDislike(product._id)}
                      className={`${styles.dislikeButton} ${product.dislikes?.includes(currentUser?._id) ? styles.active : ''}`}
                    >
                      👎 {product.dislikeCount || 0}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;