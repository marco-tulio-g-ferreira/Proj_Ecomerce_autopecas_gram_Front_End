import CheckoutPDV from "./CheckoutPDV";
import api from "../services/api";

export default function PdvWrapper() {
  // Função que busca no servidor sem paginação local
  const buscarProdutoNoServidor = async (termo) => {
    try {
      const response = await api.get(`products/?search=${encodeURIComponent(termo)}`);
      return response.data.results || response.data || [];
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