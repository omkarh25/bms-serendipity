"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from '@fullcalendar/core';
import { TransactionsAPI, FutureAPI } from "@/utils/api";
import { Transaction, FuturePrediction } from "@/types/models";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  amount: number;
  type: 'transaction' | 'prediction';
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    department?: string;
    description?: string;
    amount: number;
    type: 'transaction' | 'prediction';
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [transactionsResult, futureResult] = await Promise.allSettled([
        TransactionsAPI.getAll(),
        FutureAPI.getAll(),
      ]);

      const calendarEvents: CalendarEvent[] = [];

      if (transactionsResult.status === 'fulfilled') {
        const transactions = transactionsResult.value as Transaction[];
        transactions.forEach((transaction) => {
          const date = new Date(transaction.Date);
          calendarEvents.push({
            id: `transaction-${date.getTime()}`,
            title: `${transaction.Department}: ₹${transaction.Amount}`,
            start: date.toISOString(),
            end: date.toISOString(),
            amount: transaction.Amount,
            type: 'transaction',
            backgroundColor: transaction.Amount >= 0 ? '#dcfce7' : '#fee2e2',
            borderColor: transaction.Amount >= 0 ? '#22c55e' : '#ef4444',
            textColor: transaction.Amount >= 0 ? '#166534' : '#991b1b',
            extendedProps: {
              department: transaction.Department,
              amount: transaction.Amount,
              type: 'transaction'
            }
          });
        });
      } else {
        console.error('Error fetching transactions:', transactionsResult.reason);
      }

      if (futureResult.status === 'fulfilled') {
        const predictions = futureResult.value as FuturePrediction[];
        predictions.forEach((prediction) => {
          const date = new Date(prediction.Date);
          calendarEvents.push({
            id: `prediction-${date.getTime()}`,
            title: `Predicted: ₹${prediction.Amount}`,
            start: date.toISOString(),
            end: date.toISOString(),
            amount: prediction.Amount,
            type: 'prediction',
            backgroundColor: '#fef9c3',
            borderColor: '#eab308',
            textColor: '#854d0e',
            extendedProps: {
              description: prediction.Description,
              amount: prediction.Amount,
              type: 'prediction'
            }
          });
        });
      } else {
        console.error('Error fetching future predictions:', futureResult.reason);
      }

      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start?.toISOString() || '',
      end: event.end?.toISOString() || event.start?.toISOString() || '',
      amount: event.extendedProps.amount,
      type: event.extendedProps.type,
      backgroundColor: event.backgroundColor || '',
      borderColor: event.borderColor || '',
      textColor: event.textColor || '',
      extendedProps: {
        ...event.extendedProps,
        amount: event.extendedProps.amount,
        type: event.extendedProps.type
      }
    });
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
        <p className="text-gray-600 mt-2">View transactions and future predictions in calendar format</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              eventClick={handleEventClick}
              height="600px"
              nowIndicator={true}
              editable={true}
              droppable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
            />
          </div>

          {selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                <div className="space-y-2">
                  <p><strong>Type:</strong> {selectedEvent.type}</p>
                  <p><strong>Amount:</strong> ₹{selectedEvent.amount}</p>
                  <p><strong>Date:</strong> {new Date(selectedEvent.start).toLocaleDateString()}</p>
                  {selectedEvent.extendedProps.department && (
                    <p><strong>Department:</strong> {selectedEvent.extendedProps.department}</p>
                  )}
                  {selectedEvent.extendedProps.description && (
                    <p><strong>Description:</strong> {selectedEvent.extendedProps.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
