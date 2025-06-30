import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { ShoppingBag, Plus, Package, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  price: number
  description: string
}

interface ProductStoreProps {
  onPurchase: () => void
}

export default function ProductStore({ onPurchase }: ProductStoreProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: ''
  })
  const [addingProduct, setAddingProduct] = useState(false)
  const [buyingProduct, setBuyingProduct] = useState<number | null>(null)

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts()
      setProducts(data)
    } catch (error: any) {
      toast.error('Failed to load products')
      console.error('Products fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = parseFloat(newProduct.price)
    
    if (!newProduct.name.trim() || !price || price <= 0 || !newProduct.description.trim()) {
      toast.error('Please fill all fields with valid data')
      return
    }

    setAddingProduct(true)
    try {
      await api.addProduct(newProduct.name.trim(), price, newProduct.description.trim())
      toast.success('Product added successfully!')
      setNewProduct({ name: '', price: '', description: '' })
      setShowAddForm(false)
      fetchProducts()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add product')
    } finally {
      setAddingProduct(false)
    }
  }

  const handleBuyProduct = async (productId: number, productName: string, price: number) => {
    setBuyingProduct(productId)
    try {
      await api.buyProduct(productId)
      toast.success(`Successfully purchased ${productName}!`)
      onPurchase()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to purchase product')
    } finally {
      setBuyingProduct(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Product Store</h3>
              <p className="text-gray-600 text-sm">Browse and purchase products</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Add New Product</h4>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="input-field"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Enter product description"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={addingProduct}
                  className="btn-primary flex items-center gap-2"
                >
                  {addingProduct ? (
                    <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add Product
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No products available</p>
            <p className="text-sm">Add some products to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  <p className="text-lg font-bold text-primary-600">₹{product.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleBuyProduct(product.id, product.name, product.price)}
                  disabled={buyingProduct === product.id}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {buyingProduct === product.id ? (
                    <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}