import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api'; 

export default function CheckoutPDV({ onSearch, onRefreshData, onAddTransaction }) {
  // Estados do Carrinho e PDV
  const [cart, setCart] = useState([]);
  const [skuInput, setSkuInput] = useState('');
  const [operacaoTipo, setOperacaoTipo] = useState('SAIDA');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados do PIX
  const [pixData, setPixData] = useState(null); // { brcode: '...', txid: '...' }
  const [showPixModal, setShowPixModal] = useState(false);

  // Lógica de Adicionar Produto
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!skuInput.trim()) return;

    const resultados = await onSearch(skuInput);
    const product = resultados.find(p => 
      String(p.sku || '').trim().toLowerCase() === skuInput.trim().toLowerCase() || 
      String(p.codigo_oem || '').trim().toLowerCase() === skuInput.trim().toLowerCase()
    );

    if (product) {
      setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
        }
        return [...prev, { ...product, price: parseFloat(product.price || 0), qty: 1 }];
      });
      setSkuInput('');
      setErrorMessage('');
    } else {
      setErrorMessage(`Item "${skuInput}" não localizado.`);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const updateQty = useCallback((id, amount) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + amount) } : item));
  }, []);

  const removeItem = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // 1. Inicia o pagamento PIX no seu Backend (Sicoob)
  const iniciarPagamentoPix = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/pagamento/pix/gerar/', { 
        valor: total,
        itens: cart 
      });
      // Espera-se que seu backend retorne o brcode do Sicoob
      setPixData(response.data); 
      setShowPixModal(true);
    } catch (err) {
      setErrorMessage("Erro ao gerar PIX: " + (err.response?.data?.message || "Falha na conexão."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Finaliza a movimentação (Baixa no estoque)
  const finalizarMovimentacao = async () => {
    setIsSubmitting(true);
    try {
      await Promise.all(cart.map(async (item) => {
        const ajuste = Number(operacaoTipo === 'SAIDA' ? -item.qty : item.qty);
        await api.patch(`/products/${item.id}/update_stock/`, { quantidade: ajuste });
      }));

      if (onAddTransaction) {
        onAddTransaction(operacaoTipo === 'SAIDA' ? 'SAÍDA' : 'ENTRADA', `PDV ${operacaoTipo}`, total);
      }

      setCart([]);
      setShowPixModal(false);
      setPixData(null);
      if (onRefreshData) onRefreshData();
    } catch (error) {
      setErrorMessage(error.message || "Erro ao processar lote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[1400px] mx-auto p-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 text-slate-200">
      {/* LADO ESQUERDO: LISTA */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold">Terminal de Movimentação</h2>
          <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            {['SAIDA', 'ENTRADA'].map(tipo => (
              <button key={tipo} onClick={() => { setOperacaoTipo(tipo); setCart([]); }} className={`px-4 py-1 rounded text-[10px] font-bold ${operacaoTipo === tipo ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>
                {tipo === 'SAIDA' ? 'VENDA' : 'REPOSIÇÃO'}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-950 border border-rose-800 text-rose-200 text-xs rounded font-bold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleAddProduct} className="flex gap-2 mb-6">
          <input type="text" placeholder="Código, SKU ou OEM..." value={skuInput} onChange={e => setSkuInput(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white text-sm" />
          <button type="submit" className="bg-blue-600 px-6 rounded text-white font-bold text-xs">Incluir</button>
        </form>

        <div className="border border-zinc-800 rounded bg-zinc-950 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-zinc-900 text-zinc-500 uppercase">
              <tr><th className="p-3">SKU</th><th className="p-3">Produto</th><th className="p-3">Qtd</th><th className="p-3">Total</th><th className="p-3">Ação</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {cart.map(item => (
                <tr key={item.id}>
                  <td className="p-3 font-mono text-zinc-400">{item.sku}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="px-2 bg-zinc-800 rounded">-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="px-2 bg-zinc-800 rounded">+</button>
                  </td>
                  <td className="p-3 text-emerald-400 font-bold">R$ {(item.price * item.qty).toFixed(2)}</td>
                  <td className="p-3"><button onClick={() => removeItem(item.id)} className="text-rose-500 text-[10px] uppercase font-bold">Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LADO DIREITO: TOTAL E FINALIZAÇÃO */}
      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 h-fit">
        <h3 className="text-zinc-500 text-[10px] font-bold uppercase">Total Consolidado</h3>
        <div className="text-3xl font-bold text-white my-4">R$ {total.toFixed(2)}</div>
        <button 
          onClick={operacaoTipo === 'SAIDA' ? iniciarPagamentoPix : finalizarMovimentacao} 
          disabled={isSubmitting || cart.length === 0} 
          className="w-full py-3 bg-blue-600 rounded text-white font-bold uppercase text-xs"
        >
          {isSubmitting ? 'Processando...' : operacaoTipo === 'SAIDA' ? 'Gerar PIX' : 'Finalizar Lote'}
        </button>
      </div>

      {/* MODAL DO PIX */}
      <AnimatePresence>
        {showPixModal && pixData && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl max-w-sm w-full text-center">
              <h3 className="text-xl font-bold text-white mb-2">Pagamento via PIX</h3>
              <p className="text-zinc-400 text-sm mb-6">Escaneie ou copie o código abaixo:</p>
              
              <div className="bg-white p-4 rounded-xl mb-4 overflow-hidden">
                <div className="text-[10px] text-zinc-800 break-all font-mono">
                  {pixData.brcode}
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => navigator.clipboard.writeText(pixData.brcode)} 
                  className="w-full py-2 bg-zinc-800 text-white rounded text-xs font-bold hover:bg-zinc-700"
                >
                  Copiar Código PIX
                </button>
                <button 
                  onClick={finalizarMovimentacao} 
                  className="w-full py-3 bg-emerald-600 text-white rounded font-bold text-xs hover:bg-emerald-500"
                >
                  Confirmar Pagamento e Baixar Estoque
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}