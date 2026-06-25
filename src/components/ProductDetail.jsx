// src/components/ProductDetail.jsx

const PRODUCT_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-slate-700">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
  </svg>
);

export default function ProductDetail({ product, onBack }) {
  if (!product) return null;

  // Garantindo acesso aos dados independentemente da estrutura do objeto
  const preco = product.price ?? product.estoque?.preco ?? 0;
  const quantidade = product.stock ?? product.estoque?.quantidade ?? 0;
  const veiculos = product.veiculos_details || [];
  
  // URL da imagem
  const imageUrl = product.image_url;

  return (
    <div className="w-full max-w-[1200px] mx-auto mt-8 px-4 md:px-6 mb-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
      >
        ← Voltar para listagem
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-10">
        
        <div className="mb-10">
          <div className="flex gap-2 mb-3">
             <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md uppercase tracking-wider">
               SKU: {product.sku}
             </span>
             {product.category_details && (
               <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md uppercase">
                 {product.category_details.name}
               </span>
             )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {product.name}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-lg">
            Código OEM: <span className="text-slate-800 dark:text-slate-200 font-semibold">{product.codigo_oem || "N/A"}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr,1.5fr] gap-8">
          <div className="flex flex-col gap-4">
            {/* Exibição da Imagem ou Ícone */}
            <div className="h-80 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-2" 
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : (
                PRODUCT_ICON
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Disponibilidade</div>
                <div className={`text-3xl font-bold ${quantidade > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {quantidade}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">unidades em estoque</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Preço de Venda</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">R$ {Number(preco).toFixed(2)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">valor unitário</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Veículos Compatíveis
              </div>
              <div className="max-h-60 overflow-y-auto">
                {veiculos.length > 0 ? veiculos.map((v) => (
                  <div key={v.id} className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{v.marca} {v.modelo}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Motor: {v.motor}</div>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                      {v.ano}
                    </span>
                  </div>
                )) : <p className="p-5 text-sm text-slate-400">Nenhuma aplicação cadastrada.</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Notas Técnicas</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description || "Nenhuma nota técnica cadastrada para este item."}
          </p>
        </div>
      </div>
    </div>
  );
}