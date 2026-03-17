import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { Investor, Statement } from '@/features/portfolio/type';

interface SettingsViewProps {
  investor: Investor;
  statements: Statement[];
}

export function SettingsView({ investor, statements }: SettingsViewProps) {
  // Use the first statement as the primary one for period details.
  const statementPeriod = statements.length > 0 ? statements[0].period : null;

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Investor Profile</CardTitle>
          <CardDescription>
            View your personal investment profile details as per the latest CAS import.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={investor.name} readOnly className="bg-muted/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={investor.email} readOnly className="bg-muted/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input id="mobile" value={investor.mobile} readOnly className="bg-muted/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pan">PAN</Label>
              <Input id="pan" value={investor.pan} readOnly className="bg-muted/50" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={investor.address}
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Statement</CardTitle>
          <CardDescription>
            The date range covered by your imported portfolio statements.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {statementPeriod ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="from">Statement From</Label>
                <Input id="from" value={statementPeriod.from} readOnly className="bg-muted/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="to">Statement To</Label>
                <Input id="to" value={statementPeriod.to} readOnly className="bg-muted/50" />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No statement period information available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
