import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useBankFundPositions } from '@/hooks/useProfit'
import { useFund, useInvestFund, useRedeemFund } from '@/hooks/useFunds'
import { useBankAccounts } from '@/hooks/useAccounts'
import { BankFundPositionsTable } from '@/components/profit/BankFundPositionsTable'
import { InvestInFundDialog } from '@/components/funds/InvestInFundDialog'
import { RedeemFromFundDialog } from '@/components/funds/RedeemFromFundDialog'
import { notifySuccess } from '@/lib/errors'
import type { BankFundPosition } from '@/types/profit'
import type { ClientFundPosition } from '@/types/fund'

function bankPositionToClientPosition(p: BankFundPosition): ClientFundPosition {
  return {
    fund_id: p.fund_id,
    fund_name: p.fund_name,
    total_contributed_rsd: p.total_contributed_rsd,
    current_value_rsd: p.current_value_rsd,
    percentage_fund: p.percentage_fund,
    profit_rsd: p.profit_rsd,
    last_change_at: '',
  }
}

export function BankFundPositionsPage() {
  const { data, isLoading } = useBankFundPositions()
  const positions = data?.positions ?? []

  const [investTarget, setInvestTarget] = useState<BankFundPosition | null>(null)
  const [redeemTarget, setRedeemTarget] = useState<BankFundPosition | null>(null)
  const dialogTarget = investTarget ?? redeemTarget

  const { data: fundData } = useFund(dialogTarget?.fund_id ?? null)
  const { data: bankAccountsData } = useBankAccounts()
  const bankAccounts = bankAccountsData?.accounts ?? []

  const investMutation = useInvestFund(investTarget?.fund_id ?? 0)
  const redeemMutation = useRedeemFund(redeemTarget?.fund_id ?? 0)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bank Fund Positions</h1>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <BankFundPositionsTable
          positions={positions}
          onInvest={setInvestTarget}
          onRedeem={setRedeemTarget}
        />
      )}

      {investTarget && fundData && (
        <InvestInFundDialog
          open
          onOpenChange={(open) => !open && setInvestTarget(null)}
          fund={fundData.fund}
          accounts={bankAccounts}
          asBank
          onSubmit={(payload) =>
            investMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess(`Bank invested in ${investTarget.fund_name}.`)
                setInvestTarget(null)
              },
            })
          }
          loading={investMutation.isPending}
        />
      )}

      {redeemTarget && (
        <RedeemFromFundDialog
          open
          onOpenChange={(open) => !open && setRedeemTarget(null)}
          position={bankPositionToClientPosition(redeemTarget)}
          accounts={bankAccounts}
          asBank
          onSubmit={(payload) =>
            redeemMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess(`Bank redeemed from ${redeemTarget.fund_name}.`)
                setRedeemTarget(null)
              },
            })
          }
          loading={redeemMutation.isPending}
        />
      )}
    </div>
  )
}
