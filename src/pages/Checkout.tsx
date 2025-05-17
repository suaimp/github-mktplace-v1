import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useCart } from '../components/marketplace/ShoppingCartContext';
import { formatCurrency } from '../components/marketplace/utils';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import Label from '../components/form/Label';
import Select from '../components/form/Select';

export default function Checkout() {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'credit_card'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart after successful checkout
      await clearCart();
      
      // Show success message
      setSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Error processing checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <PageMeta
          title="Pedido Confirmado | Marketplace"
          description="Seu pedido foi confirmado com sucesso"
        />
        <PageBreadcrumb pageTitle="Pedido Confirmado" />
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Pedido Confirmado!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Seu pedido foi processado com sucesso. Você receberá um email com os detalhes do pedido em breve.
            </p>
            <Button onClick={() => navigate('/')}>
              Voltar para a Loja
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <PageMeta
          title="Checkout | Marketplace"
          description="Finalizar compra"
        />
        <PageBreadcrumb pageTitle="Checkout" />
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Adicione alguns produtos ao seu carrinho antes de finalizar a compra.
            </p>
            <Button onClick={() => navigate('/')}>
              Voltar para a Loja
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Checkout | Marketplace"
        description="Finalizar compra"
      />
      <PageBreadcrumb pageTitle="Checkout" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">{item.product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-500 dark:text-gray-400">Subtotal</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">{formatCurrency(totalPrice)}</p>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="font-semibold text-gray-800 dark:text-white/90">Total</p>
                  <p className="font-semibold text-gray-800 dark:text-white/90">{formatCurrency(totalPrice)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Informações de Pagamento</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Nome Completo</Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Endereço</Label>
                    <Input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Estado</Label>
                    <Select
                      options={[
                        { value: "AC", label: "Acre" },
                        { value: "AL", label: "Alagoas" },
                        { value: "AP", label: "Amapá" },
                        { value: "AM", label: "Amazonas" },
                        { value: "BA", label: "Bahia" },
                        { value: "CE", label: "Ceará" },
                        { value: "DF", label: "Distrito Federal" },
                        { value: "ES", label: "Espírito Santo" },
                        { value: "GO", label: "Goiás" },
                        { value: "MA", label: "Maranhão" },
                        { value: "MT", label: "Mato Grosso" },
                        { value: "MS", label: "Mato Grosso do Sul" },
                        { value: "MG", label: "Minas Gerais" },
                        { value: "PA", label: "Pará" },
                        { value: "PB", label: "Paraíba" },
                        { value: "PR", label: "Paraná" },
                        { value: "PE", label: "Pernambuco" },
                        { value: "PI", label: "Piauí" },
                        { value: "RJ", label: "Rio de Janeiro" },
                        { value: "RN", label: "Rio Grande do Norte" },
                        { value: "RS", label: "Rio Grande do Sul" },
                        { value: "RO", label: "Rondônia" },
                        { value: "RR", label: "Roraima" },
                        { value: "SC", label: "Santa Catarina" },
                        { value: "SP", label: "São Paulo" },
                        { value: "SE", label: "Sergipe" },
                        { value: "TO", label: "Tocantins" }
                      ]}
                      value={formData.state}
                      onChange={(value) => handleSelectChange('state', value)}
                      placeholder="Selecione o estado"
                    />
                  </div>
                  
                  <div>
                    <Label>CEP</Label>
                    <Input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Método de Pagamento</Label>
                    <Select
                      options={[
                        { value: "credit_card", label: "Cartão de Crédito" },
                        { value: "pix", label: "PIX" },
                        { value: "bank_transfer", label: "Transferência Bancária" }
                      ]}
                      value={formData.paymentMethod}
                      onChange={(value) => handleSelectChange('paymentMethod', value)}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                      </span>
                    ) : (
                      `Finalizar Compra (${formatCurrency(totalPrice)})`
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}