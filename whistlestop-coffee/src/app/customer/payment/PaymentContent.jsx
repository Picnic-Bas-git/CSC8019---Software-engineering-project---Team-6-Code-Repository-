// React hooks for loading cart data and managing payment form state
import { useEffect, useMemo, useState } from 'react';

// Next.js helpers for navigation and query string access
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Reusable UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/*
  This page simulates a payment screen before the HorsePay request is made.

  The card fields are only UI simulation.
  Actual payment success/failure is determined by the backend HorsePay call.
*/

/**
 * Formats a number into GBP currency.
 * Example: 3.5 -> £3.50
 */
function money(n) {
  return `£${n.toFixed(2)}`;
}

/**
 * Removes all non-digit characters from a string.
 */
function digitsOnly(value) {
  return value.replace(/\D/g, '');
}

/**
 * Formats a card number in groups of 4 digits.
 * Example:
 * 1234567890123456 -> 1234 5678 9012 3456
 */
function formatCardNumber(value) {
  const digits = digitsOnly(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Formats expiry as MM/YY while the user types.
 * Examples:
 * 3    -> 03
 * 7    -> 07
 * 12   -> 12
 * 123  -> 12/3
 * 0125 -> 01/25
 */
function formatExpiry(value) {
  let digits = digitsOnly(value).slice(0, 4);

  // If the user starts with 2-9, assume a leading zero month
  if (digits.length === 1 && Number(digits) > 1) {
    digits = `0${digits}`;
  }

  // If user has typed at least 3 digits, insert slash
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return digits;
}

/**
 * Validates expiry in MM/YY format and checks that it is not expired.
 */
function validateExpiry(expiry) {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return 'Expiry date must be in MM/YY format';
  }

  const [monthString, yearString] = expiry.split('/');
  const month = Number(monthString);
  const shortYear = Number(yearString);

  if (month < 1 || month > 12) {
    return 'Expiry month must be between 01 and 12';
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (shortYear < currentYear) {
    return 'Card has expired';
  }

  if (shortYear === currentYear && month < currentMonth) {
    return 'Card has expired';
  }

  return '';
}

/**
 * Validates the fake card form fields before allowing payment.
 */
function validatePaymentFields({ cardName, cardNumber, expiry, cvv }) {
  if (!cardName.trim()) {
    return 'Cardholder name is required';
  }

  const cardDigits = digitsOnly(cardNumber);
  if (cardDigits.length !== 16) {
    return 'Card number must be 16 digits';
  }

  const expiryError = validateExpiry(expiry);
  if (expiryError) {
    return expiryError;
  }

  const cvvDigits = digitsOnly(cvv);
  if (cvvDigits.length !== 3) {
    return 'CVV must be 3 digits';
  }

  return '';
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read pickup details passed from the checkout details page
  const pickupName = searchParams.get('pickupName') || '';
  const notes = searchParams.get('notes') || '';

  // Holds current cart items from backend
  const [items, setItems] = useState([]);

  // Tracks loading state
  const [isLoading, setIsLoading] = useState(true);

  // Tracks payment submission state
  const [submitting, setSubmitting] = useState(false);

  // Stores page-level error
  const [error, setError] = useState('');

  // Fake card fields for UI simulation
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Load backend cart for final payment summary
  useEffect(() => {
    async function loadCart() {
      try {
        setError('');

        const res = await fetch('/api/cart', {
          cache: 'no-store',
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load cart');
          setItems([]);
          return;
        }

        setItems(data.items || []);
      } catch {
        setError('Something went wrong while loading payment details.');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCart();
  }, []);

  // Subtotal from backend cart
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.lineTotal, 0),
    [items],
  );

  // Simulated payment submit
  async function handlePayNow() {
    const validationError = validatePaymentFields({
      cardName,
      cardNumber,
      expiry,
      cvv,
    });

    if (!pickupName.trim()) {
      setError('Pickup name is required.');
      return;
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupName,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.reason || data.error || 'Payment failed');
        return;
      }

      // Refresh cart badge in header
      window.dispatchEvent(new Event('cart-updated'));

      router.push(`/customer/status?placed=${data.order.id}`);
      router.refresh();
    } catch {
      setError('Something went wrong while processing payment.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/70 coffee-card">
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">
              Loading payment page...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-border/60 bg-card/70 coffee-card">
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-muted-foreground text-sm">
              Your cart is empty.
            </div>
            <Link href="/customer/menu">
              <Button>Browse menu</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Payment summary */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Pickup name</div>
            <div className="font-medium">{pickupName || '-'}</div>
          </div>

          {notes ? (
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Notes</div>
              <div className="font-medium">{notes}</div>
            </div>
          ) : null}

          <div className="space-y-3 pt-2">
            <div className="text-sm font-medium">Order summary</div>

            {items.map((item) => (
              <div
                key={item.id}
                className="border-border/60 bg-background/40 flex items-center justify-between gap-3 rounded-xl border p-3"
              >
                <div className="min-w-0">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground text-xs">
                    Size: {item.size} · {money(item.unitPrice)} each · Qty{' '}
                    {item.quantity}
                  </div>
                </div>

                <div className="font-semibold">{money(item.lineTotal)}</div>
              </div>
            ))}
          </div>

          <div className="border-border/60 flex items-center justify-between border-t pt-3">
            <div className="text-muted-foreground text-sm">Total</div>
            <div className="font-semibold">{money(subtotal)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Fake card form */}
      <Card className="border-border/60 bg-card/70 coffee-card">
        <CardHeader>
          <CardTitle>Card details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error message shown when validation or payment fails */}
          {error ? <div className="text-sm text-red-500">{error}</div> : null}

          <div className="space-y-2">
            <Label htmlFor="card-name">Cardholder name</Label>
            <Input
              id="card-name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Name on card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-number">Card number</Label>
            <Input
              id="card-number"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry</Label>
              <Input
                id="expiry"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                inputMode="numeric"
                value={cvv}
                onChange={(e) => setCvv(digitsOnly(e.target.value).slice(0, 3))}
                placeholder="123"
                maxLength={3}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Link
              href={`/customer/order?pickupName=${encodeURIComponent(
                pickupName,
              )}&notes=${encodeURIComponent(notes)}`}
              className="sm:order-1"
            >
              <Button variant="outline" className="w-full sm:w-auto">
                Back
              </Button>
            </Link>

            <Button
              className="sm:order-2"
              onClick={handlePayNow}
              disabled={submitting}
            >
              {submitting ? 'Processing payment...' : `Pay ${money(subtotal)}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
