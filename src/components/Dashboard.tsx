import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import BalanceCard from './BalanceCard'
import FundWallet from './FundWallet'
import PayUser from './PayUser'
import TransactionHistory from './TransactionHistory'
import ProductStore from './ProductStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs'

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    refreshUser()
  }, [])

  const handleTransactionComplete = () => {
    refreshUser()
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">Manage your digital wallet and transactions</p>
        </div>
      </div>

      <BalanceCard />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fund">Fund</TabsTrigger>
          <TabsTrigger value="pay">Pay</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FundWallet onSuccess={handleTransactionComplete} />
            <PayUser onSuccess={handleTransactionComplete} />
          </div>
          <TransactionHistory />
        </TabsContent>

        <TabsContent value="fund">
          <FundWallet onSuccess={handleTransactionComplete} />
        </TabsContent>

        <TabsContent value="pay">
          <PayUser onSuccess={handleTransactionComplete} />
        </TabsContent>

        <TabsContent value="store">
          <ProductStore onPurchase={handleTransactionComplete} />
        </TabsContent>
      </Tabs>
    </div>
  )
}