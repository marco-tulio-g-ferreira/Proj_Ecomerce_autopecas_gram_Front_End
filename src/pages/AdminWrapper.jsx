import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import ProductDetail from '../components/ProductDetail';
import api from '../services/api';

export default function AdminWrapper() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const abortControllerRef = useRef(null);

  const loadProducts = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const query = searchParams.toString();
    
    try {
      const res = await api.get(`/products/?${query}`, {
        signal: abortControllerRef.current.signal
      });
      
      const data = res.data;
      setProducts(data.results || []); 
      setPagination({ 
        count: data.count || 0, 
        next: data.next, 
        previous: data.previous 
      });
    } catch (err) {
      if (err?.name !== 'CanceledError' && err?.name !== 'AbortError' && err?.message !== 'canceled') {
        console.error("Erro ao carregar produtos:", err);
      }
    }
  };

  const loadInitialData = async () => {
    try {
      const [resCats, resStats] = await Promise.all([
        api.get('/categories/'),
        api.get('/category/stats/')
      ]);
      
      setCategories(Array.isArray(resCats.data) ? resCats.data : (resCats.data.results || []));
      setStats(Array.isArray(resStats.data) ? resStats.data : (resStats.data.results || []));
    } catch (err) { console.error("Erro inicial:", err); }
  };

  useEffect(() => { 
    loadInitialData(); 
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  useEffect(() => { 
    loadProducts(); 
  }, [searchParams]);

  if (selectedProduct) {
    return (
      <ProductDetail 
        product={selectedProduct} 
        onBack={() => setSelectedProduct(null)} 
      />
    );
  }

  return (
    <AdminDashboard 
      products={products} 
      categories={categories} 
      stats={stats}
      pagination={pagination} 
      onRefreshData={loadProducts}
      onSelectProduct={setSelectedProduct} 
    />
  );
}