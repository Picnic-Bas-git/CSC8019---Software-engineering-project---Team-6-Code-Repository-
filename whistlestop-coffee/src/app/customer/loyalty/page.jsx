'use client';

// React hooks for loading loyalty data from the backend
import { useEffect, useState } from 'react';

// Reusable UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/*
  This page lets the signed-in customer view their loyalty progress.

  It shows:
  - current loyalty points
  - current loyalty stamps
  - loyalty history from previous orders or adjustments
*/

/**
 * Converts loyalty record types into friendlier text.
 */
function loyaltyTypeLabel(type) {
  switch (type) {
    case 'EARN':
      return 'Earned';
    case 'REDEEM':
      return 'Redeemed';
    case 'ADJUSTMENT':
      return 'Adjustment';
    default:
      return type || '-';
  }
}

export default function LoyaltyPage() {
  // Holds the loyalty totals returned by the backend
  const [loyalty, setLoyalty] = useState(null);

  // Holds the loyalty history returned by the backend
  const [history, setHistory] = useState([]);

  // Tracks whether loyalty data is still loading
  const [isLoading, setIsLoading] = useState(true);

  // Stores any loading error
  const [error, setError] = useState('');

  /**
   * Loads loyalty totals and history from the backend API.
   */
  async function loadLoyalty() {
    try {
      setError('');

      const res = await fetch('/api/loyalty', {
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load loyalty data');
        setLoyalty(null);
        setHistory([]);
        return;
      }

      setLoyalty(data.loyalty || null);
      setHistory(data.history || []);
    } catch {
      setError('Something went wrong while loading loyalty data.');
      setLoyalty(null);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Load loyalty data once when the page first renders
  useEffect(() => {
    loadLoyalty();
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      {/* Loyalty summary */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader>
          <CardTitle>Loyalty</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Loading state */}
          {isLoading ? (
            <div className="text-muted-foreground text-sm">
              Loading loyalty data...
            </div>
          ) : null}

          {/* Error state */}
          {!isLoading && error ? (
            <div className="text-sm text-red-500">{error}</div>
          ) : null}

          {/* Loyalty totals */}
          {!isLoading && loyalty ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border-border/60 bg-background/40 rounded-xl border p-4">
                <div className="text-muted-foreground text-xs">
                  Loyalty points
                </div>
                <div className="text-2xl font-semibold">
                  {loyalty.points ?? 0}
                </div>
              </div>

              <div className="border-border/60 bg-background/40 rounded-xl border p-4">
                <div className="text-muted-foreground text-xs">
                  Loyalty stamps
                </div>
                <div className="text-2xl font-semibold">
                  {loyalty.stamps ?? 0}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Loyalty history */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader>
          <CardTitle>Loyalty History</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Empty state */}
          {!isLoading && !error && history.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              No loyalty history yet.
            </div>
          ) : null}

          {/* History records */}
          {!isLoading &&
            history.map((record) => (
              <div
                key={record.id}
                className="border-border/60 bg-background/40 rounded-xl border p-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {loyaltyTypeLabel(record.type)}
                    </div>

                    <div className="text-muted-foreground text-xs">
                      {record.description || 'Loyalty update'}
                    </div>

                    <div className="text-muted-foreground text-xs">
                      {new Date(record.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-sm font-medium">
                    <div>
                      Points: {record.pointsChange >= 0 ? '+' : ''}
                      {record.pointsChange}
                    </div>
                    <div>
                      Stamps: {record.stampsChange >= 0 ? '+' : ''}
                      {record.stampsChange}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
