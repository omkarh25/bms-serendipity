'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '../utils/dateFormatter';

export default function DateDisplay() {
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    // Format today's date in ISO format
    const today = new Date().toISOString().split('T')[0];
    setDateStr(formatDate(today));
  }, []);

  return (
    <span className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600">
      {dateStr}
    </span>
  );
}
