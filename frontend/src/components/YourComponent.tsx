import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function YourComponent() {
  // Start with an empty string to avoid hydration mismatch
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    // Set the date only on the client side with a consistent format
    const now = new Date();
    setFormattedDate(format(now, 'MM/dd/yyyy')); // Example: 11/22/2024
  }, []);

  return (
    <div>
      <span className="inline-flex items-center px-3 py-2 border border-transparent text-sm">
        {formattedDate || 'Loading...'} {/* Show a placeholder during initial render */}
      </span>
    </div>
  );
}
