import { useState } from 'react';
import ProductCatalog from './ProductCatalog'; 
import ProductDetail from '../components/ProductDetail'; 

export default function CatalogWrapper() {
  const [selectedProduct, setSelectedProduct] = useState(null);
console.log("Wrapper renderizado, função de seleção definida:", !!setSelectedProduct);
  // Se um produto foi selecionado, exibimos o detalhe
  if (selectedProduct) {
    return (
      <ProductDetail 
        product={selectedProduct} 
        onBack={() => setSelectedProduct(null)} 
      />
    );
  }

  // Caso contrário, exibimos a listagem passando a função de seleção
 return (
    <ProductCatalog onSelectProduct={setSelectedProduct} />
  );
}