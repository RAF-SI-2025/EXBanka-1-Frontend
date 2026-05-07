import type { PeerBank } from '@/types/peerBank'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PeerBanksTableProps {
  peerBanks: PeerBank[]
  onEdit: (peer: PeerBank) => void
  onDelete: (peer: PeerBank) => void
  onToggleActive: (peer: PeerBank) => void
}

export function PeerBanksTable({
  peerBanks,
  onEdit,
  onDelete,
  onToggleActive,
}: PeerBanksTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bank Code</TableHead>
          <TableHead>Routing #</TableHead>
          <TableHead>Base URL</TableHead>
          <TableHead>API Token</TableHead>
          <TableHead>HMAC</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {peerBanks.map((peer) => (
          <TableRow key={peer.id}>
            <TableCell className="font-medium">{peer.bank_code}</TableCell>
            <TableCell>{peer.routing_number}</TableCell>
            <TableCell className="font-mono text-xs break-all">{peer.base_url}</TableCell>
            <TableCell className="font-mono text-xs">{peer.api_token_preview}</TableCell>
            <TableCell>
              <Badge variant={peer.hmac_enabled ? 'default' : 'secondary'}>
                {peer.hmac_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={peer.active ? 'default' : 'secondary'}>
                {peer.active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => onEdit(peer)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => onToggleActive(peer)}>
                  {peer.active ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(peer)}>
                  Remove
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
