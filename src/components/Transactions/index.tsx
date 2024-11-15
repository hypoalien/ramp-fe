import { useCallback, useState, useEffect } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams, Transaction } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()
  const [approvedTransactions, setApprovedTransactions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (transactions) {
      const newApprovedState = { ...approvedTransactions }
      transactions.forEach((transaction) => {
        if (!(transaction.id in newApprovedState)) {
          newApprovedState[transaction.id] = transaction.approved
        }
      })
      setApprovedTransactions(newApprovedState)
    }
  }, [transactions])

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      setApprovedTransactions((prev) => ({
        ...prev,
        [transactionId]: newValue,
      }))
    },
    [fetchWithoutCache]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={{
            ...transaction,
            approved: approvedTransactions[transaction.id] ?? transaction.approved,
          }}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
