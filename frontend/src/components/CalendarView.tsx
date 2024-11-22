"use client";

import React from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { Transaction, FuturePrediction, Category } from '../types/models';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  amount: number;
  category: Category;
  department: string;
  description: string;
  isPrediction: boolean;
}

interface CalendarViewProps {
  transactions: Transaction[];
  futurePredictions: FuturePrediction[];
}

/**
 * CalendarView component that displays transactions and future predictions in a calendar format
 * @param {CalendarViewProps} props - Component props containing transactions and future predictions
 * @returns {JSX.Element} Calendar view of financial events
 */
const CalendarView: React.FC<CalendarViewProps> = ({ transactions, futurePredictions }) => {
  // Convert transactions and predictions to calendar events
  const events: CalendarEvent[] = [
    ...transactions.map((t) => ({
      id: `t-${t.TrNo}`,
      title: `₹${Math.abs(t.Amount).toLocaleString()}`,
      start: new Date(t.Date),
      end: new Date(t.Date),
      amount: t.Amount,
      category: t.Category,
      department: t.Department,
      description: t.Description,
      isPrediction: false,
    })),
    ...futurePredictions.map((f) => ({
      id: `f-${f.TrNo}`,
      title: `₹${Math.abs(f.Amount).toLocaleString()}`,
      start: new Date(f.Date),
      end: new Date(f.Date),
      amount: f.Amount,
      category: f.Category,
      department: f.Department,
      description: f.Description,
      isPrediction: true,
    })),
  ];

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = event.amount >= 0 ? '#10B981' : '#EF4444';
    const borderColor = event.amount >= 0 ? '#059669' : '#DC2626';
    
    // Adjust opacity for predictions
    const opacity = event.isPrediction ? 0.7 : 1;
    
    const style: React.CSSProperties = {
      backgroundColor,
      borderColor,
      opacity,
      color: 'white',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '4px',
      display: 'block',
      padding: '2px 4px',
      fontSize: '0.875rem',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    };

    return {
      style,
      className: 'rbc-event-content hover:opacity-90',
    };
  };

  // Custom tooltip component
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="group relative">
      <div className="flex items-center gap-1">
        <span className={event.amount >= 0 ? 'text-green-100' : 'text-red-100'}>
          {event.amount >= 0 ? '↑' : '↓'}
        </span>
        <span>{event.title}</span>
      </div>
      <div className="absolute hidden group-hover:block z-50 bg-gray-900/95 text-white p-3 rounded-lg shadow-lg -mt-1 left-full ml-2 min-w-[200px] backdrop-blur-sm">
        <p className="font-semibold mb-1">{event.description}</p>
        <div className="space-y-1 text-sm">
          <p className={event.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
            Amount: ₹{Math.abs(event.amount).toLocaleString()}
          </p>
          <p className="text-gray-300">Category: {event.category}</p>
          <p className="text-gray-300">Department: {event.department}</p>
          {event.isPrediction && (
            <p className="text-yellow-400 font-medium mt-2">
              Future Prediction
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Financial Calendar</h2>
        <p className="text-sm text-gray-500 mt-1">
          View all transactions and future predictions
        </p>
      </div>
      <div className="p-4">
        <div className="h-[700px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent,
            }}
            views={['month', 'week', 'day']}
            defaultView={Views.MONTH}
            tooltipAccessor={null}
            popup
            className="rounded-lg"
          />
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Expense</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 opacity-70 rounded-full"></div>
            <span className="text-gray-600">Future Prediction</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
