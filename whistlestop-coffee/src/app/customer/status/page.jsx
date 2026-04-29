'use client';

import { Suspense } from 'react';
import StatusContent from './StatusContent';

export default function StatusPage() {
  return (
    <Suspense fallback={<div>Loading order status...</div>}>
      <StatusContent />
    </Suspense>
  );
}
