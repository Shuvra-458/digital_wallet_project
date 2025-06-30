import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { History, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface Transaction {
  kind: string
  amt: number
  updated_bal: number
  timestamp: string
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = async () => {
    try {
      const data = await api.getStatement()
      setTransactions(data)
    } catch (error: any) {
      toast.error('Failed to load transaction history')
      console.error('Transaction fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    await fetchTransactions()
    toast.success('Transactions refreshed')
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <History className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
            <p className="text-gray-600 text-sm">Your recent transactions</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'loading-spinner' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No transactions yet</p>
          <p className="text-sm">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((transaction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  transaction.kind === 'credit' 
                    ? 'bg-success-100 text-success-600' 
                    : 'bg-error-100 text-error-600'
                }`}>
                  {transaction.kind === 'credit' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {transaction.kind}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(transaction.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.kind === 'credit' ? 'text-success-600' : 'text-error-600'
                }`}>
                  {transaction.kind === 'credit' ? '+' : '-'}₹{transaction.amt.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Balance: ₹{transaction.updated_bal.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}