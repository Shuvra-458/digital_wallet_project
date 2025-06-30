import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { Wallet, RefreshCw, DollarSign, Euro, PoundSterling } from 'lucide-react'
import toast from 'react-hot-toast'

const currencies = [
  { code: 'INR', symbol: '₹', icon: Wallet },
  { code: 'USD', symbol: '$', icon: DollarSign },
  { code: 'EUR', symbol: '€', icon: Euro },
  { code: 'GBP', symbol: '£', icon: PoundSterling },
]

export default function BalanceCard() {
  const { user, refreshUser } = useAuth()
  const [selectedCurrency, setSelectedCurrency] = useState('INR')
  const [convertedBalance, setConvertedBalance] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleCurrencyChange = async (currency: string) => {
    if (currency === 'INR') {
      setSelectedCurrency('INR')
      setConvertedBalance('')
      return
    }

    setLoading(true)
    try {
      const response = await api.getBalance(currency)
      setConvertedBalance(response.balance)
      setSelectedCurrency(currency)
    } catch (error) {
      toast.error('Failed to convert currency')
      console.error('Currency conversion error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    await refreshUser()
    if (selectedCurrency !== 'INR') {
      await handleCurrencyChange(selectedCurrency)
    }
    setLoading(false)
    toast.success('Balance refreshed')
  }

  const currentCurrency = currencies.find(c => c.code === selectedCurrency)
  const CurrentIcon = currentCurrency?.icon || Wallet

  return (
    <div className="balance-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <CurrentIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Current Balance</h2>
            <p className="text-primary-100 text-sm">Available funds</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-white ${loading ? 'loading-spinner' : ''}`} />
        </button>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-white mb-2">
          {selectedCurrency === 'INR' ? `₹${user?.balance?.toFixed(2) || '0.00'}` : convertedBalance}
        </div>
        {selectedCurrency !== 'INR' && (
          <div className="text-primary-100 text-sm">
            ≈ ₹{user?.balance?.toFixed(2) || '0.00'} INR
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {currencies.map((currency) => {
          const Icon = currency.icon
          return (
            <button
              key={currency.code}
              onClick={() => handleCurrencyChange(currency.code)}
              disabled={loading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCurrency === currency.code
                  ? 'bg-white text-primary-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {currency.code}
            </button>
          )
        })}
      </div>
    </div>
  )
}