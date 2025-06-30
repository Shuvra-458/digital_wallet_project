import React, { useState } from 'react'
import { api } from '../services/api'
import { PlusCircle, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

interface FundWalletProps {
  onSuccess: () => void
}

export default function FundWallet({ onSuccess }: FundWalletProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fundAmount = parseFloat(amount)
    
    if (!fundAmount || fundAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      const response = await api.fundWallet(fundAmount)
      toast.success(`₹${fundAmount} added to your wallet!`)
      setAmount('')
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fund wallet')
    } finally {
      setLoading(false)
    }
  }

  const quickAmounts = [100, 500, 1000, 2000]

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-success-100 rounded-lg">
          <PlusCircle className="w-6 h-6 text-success-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Fund Wallet</h3>
          <p className="text-gray-600 text-sm">Add money to your wallet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field pl-8"
              placeholder="0.00"
              min="1"
              step="0.01"
              required
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick amounts</p>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ₹{quickAmount}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Add Funds
            </>
          )}
        </button>
      </form>
    </div>
  )
}