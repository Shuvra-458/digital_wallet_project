import React, { useState } from 'react'
import { api } from '../services/api'
import { Send, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface PayUserProps {
  onSuccess: () => void
}

export default function PayUser({ onSuccess }: PayUserProps) {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payAmount = parseFloat(amount)
    
    if (!recipient.trim()) {
      toast.error('Please enter recipient username')
      return
    }
    
    if (!payAmount || payAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      const response = await api.payUser(recipient.trim(), payAmount)
      toast.success(`₹${payAmount} sent to ${recipient}!`)
      setRecipient('')
      setAmount('')
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Send className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Send Money</h3>
          <p className="text-gray-600 text-sm">Transfer funds to another user</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="input-field pl-10"
              placeholder="Enter username"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="payAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              id="payAmount"
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

        <button
          type="submit"
          disabled={loading || !recipient.trim() || !amount}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Payment
            </>
          )}
        </button>
      </form>
    </div>
  )
}