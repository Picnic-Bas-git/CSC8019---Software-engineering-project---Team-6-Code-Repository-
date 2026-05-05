'use client';

import { Suspense } from 'react';
import StatusContent from './StatusContent';

// Could not use Serverside components here, had to move to separate jsx file. same in order and payment
export default function StatusPage() {
  return (
    <Suspense fallback={<div>Loading order status...</div>}>
      <StatusContent />
    </Suspense>
  );
}
