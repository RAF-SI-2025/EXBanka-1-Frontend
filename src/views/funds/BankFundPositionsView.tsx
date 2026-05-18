import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BankFundPositionsTable } from '@/views/funds/components/BankFundPositionsTable'
import { useBankAccounts } from '@/hooks/useAccounts'
import { useFund, useInvestFund, useRedeemFund } from '@/hooks/useFunds'
import { useBankFundPositions } from '@/hooks/useProfit'
import { notifySuccess } from '@/lib/errors'
import type { BankFundPosition } from '@/types/profit'
import type { ClientFundPosition } from '@/types/fund'
import { InvestInFundDialog } from '@/views/funds/components/InvestInFundDialog'
import { RedeemFromFundDialog } from '@/views/funds/components/RedeemFromFundDialog'
import { ViewShell } from '@/views/shared'

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

export function BankFundPositionsView() {
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
    <ViewShell
      title="Bank Fund Positions"
      subtitle="Funds the bank itself has invested in — invest more or redeem."
    >
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

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
    </ViewShell>
  )
}
