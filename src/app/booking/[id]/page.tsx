'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format, parse } from 'date-fns';
import { supabase, type Booking, type Space, type BookingAddOn, type AddOn } from '@/lib/supabase';

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [_space, setSpace] = useState<Space | null>(null);
  const [addOns, setAddOns] = useState<(BookingAddOn & { add_on: AddOn })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBooking = async () => {
      try {
        // Get booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', params.id)
          .single();

        if (bookingError) throw bookingError;
        if (!bookingData) {
          setError('Booking not found');
          return;
        }

        setBooking(bookingData);

        // Get space details
        const { data: spaceData } = await supabase
          .from('spaces')
          .select('*')
          .eq('id', bookingData.space_id)
          .single();

        if (spaceData) {
          setSpace(spaceData);
        }

        // Get add-ons
        const { data: addOnsData } = await supabase
          .from('booking_add_ons')
          .select('*, add_ons(*)')
          .eq('booking_id', params.id);

        if (addOnsData) {
          setAddOns(addOnsData as any);
        }
      } catch (err) {
        console.error('Failed to load booking:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#6b6b80]">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-600 text-lg">{error || 'Booking not found'}</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const displayDate = format(parse(booking.date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d, yyyy');
  const hours = booking.end_hour - booking.start_hour;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Status Banner */}
        <div
          className={`rounded-lg p-6 mb-8 text-center ${
            booking.status === 'confirmed'
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : booking.status === 'pending'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-[#0a0a0f] border border-[#2a2a3a]'
          }`}
        >
          <h1 className="text-3xl font-bold mb-2">
            {booking.status === 'confirmed'
              ? '✓ Booking Confirmed!'
              : booking.status === 'pending'
              ? 'Booking Pending'
              : 'Booking Completed'}
          </h1>
          <p
            className={`text-lg font-semibold ${
              booking.status === 'confirmed'
                ? 'text-emerald-400'
                : booking.status === 'pending'
                ? 'text-blue-700'
                : 'text-[#e4e4ed]'
            }`}
          >
            Booking #{booking.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Booking Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Booking Info */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="card space-y-4">
              <h2 className="text-xl font-bold text-white">Date & Time</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#6b6b80]">Date</span>
                  <span className="font-semibold text-white">{displayDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b6b80]">Time</span>
                  <span className="font-semibold text-white">
                    {String(booking.start_hour).padStart(2, '0')}:00 -{' '}
                    {String(booking.end_hour).padStart(2, '0')}:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b6b80]">Duration</span>
                  <span className="font-semibold text-white">
                    {hours} hour{hours !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="card space-y-4">
              <h2 className="text-xl font-bold text-white">Customer Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#6b6b80]">Name</span>
                  <span className="font-semibold text-white">{booking.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b6b80]">Email</span>
                  <span className="font-semibold text-white">{booking.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b6b80]">Phone</span>
                  <span className="font-semibold text-white">{booking.customer_phone}</span>
                </div>
              </div>
            </div>

            {/* E-transfer Info */}
            {booking.etransfer_reference && (
              <div className="card space-y-4 bg-blue-50 border border-blue-200">
                <h2 className="text-xl font-bold text-white">E-transfer Details</h2>
                <div className="flex justify-between">
                  <span className="text-[#6b6b80]">Reference</span>
                  <span className="font-mono font-semibold text-white">
                    {booking.etransfer_reference}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Price Summary */}
          <div className="space-y-6">
            {/* Price Breakdown */}
            <div className="card space-y-4">
              <h2 className="text-xl font-bold text-white">Price Breakdown</h2>

              <div className="space-y-3 border-b border-[#2a2a3a] pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b80]">Court Rental ({hours}h)</span>
                  <span className="font-medium text-white">
                    ${(booking.total_amount + booking.discount_amount).toFixed(2)}
                  </span>
                </div>

                {addOns.length > 0 && (
                  <>
                    {addOns.map((ao) => (
                      <div key={ao.id} className="flex justify-between text-sm">
                        <span className="text-[#6b6b80]">
                          {(ao as any).add_ons?.name || 'Add-on'} x {ao.quantity}
                        </span>
                        <span className="font-medium text-white">
                          ${(ao.price_at_booking * ao.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {booking.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount</span>
                    <span className="font-medium">-${booking.discount_amount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>${booking.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="card space-y-4">
              <h2 className="text-xl font-bold text-white">Payment Status</h2>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-white">Deposit Due</p>
                    <p className="text-lg font-bold text-cyan-400 mt-1">
                      ${booking.deposit_amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-[#6b6b80] mt-2">
                      50% of total to confirm your booking
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0f] p-4 rounded-lg">
                <p className="text-sm font-medium text-white mb-2">Payment Verified:</p>
                <p
                  className={`text-sm font-semibold ${
                    booking.payment_verified ? 'text-green-600' : 'text-[#6b6b80]'
                  }`}
                >
                  {booking.payment_verified ? '✓ Yes' : '✗ Pending'}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="card bg-blue-50 border border-blue-200 space-y-4">
              <h2 className="text-xl font-bold text-white">Next Steps</h2>
              <ol className="space-y-2 text-sm text-[#e4e4ed] list-decimal list-inside">
                <li>Send your deposit via e-transfer</li>
                <li>Include your booking reference in the transfer note</li>
                <li>We'll verify and confirm your booking</li>
                <li>Confirmation email will be sent to {booking.customer_email}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <button
            onClick={() => router.push('/')}
            className="btn-primary inline-block"
          >
            Back to Home
          </button>
          <p className="text-[#6b6b80] text-sm">
            Questions? Contact us at info@thebarn.local
          </p>
        </div>
      </div>
    </div>
  );
}
