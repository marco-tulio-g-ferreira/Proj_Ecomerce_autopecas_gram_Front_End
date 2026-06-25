import CheckoutPDV from "./CheckoutPDV";

export default function PdvWrapper() {
  // Função que busca no servidor sem paginação local
  const buscarProdutoNoServidor = async (termo) => {
    try {
      const response = await fetch(`http://10.0.0.107:8000/api/products/?search=${encodeURIComponent(termo)}`);
      if (!response.ok) throw new Error('Erro na rede');
      const data = await response.json();
      return data.results || data || [];
    } catch (err) {
      console.error("Erro na busca do servidor:", err);
      return [];
    }
  };

  return (
    <CheckoutPDV 
      onSearch={buscarProdutoNoServidor} 
      onRefreshData={() => window.location.reload()} 
    />
  );
}