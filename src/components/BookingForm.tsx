'use client';

import { useState, useEffect } from 'react';
import { supabase, type Space, type AddOn, type DiscountCode } from '@/lib/supabase';

interface BookingFormProps {
  date: string;
  startHour: number;
  endHour: number;
  space: Space;
  onBookingComplete: (bookingId: string) => void;
}

export default function BookingForm({
  date,
  startHour,
  endHour,
  space,
  onBookingComplete,
}: BookingFormProps) {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<Map<string, number>>(new Map());
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [etransferReference, setEtransferReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hours = endHour - startHour;
  const baseTotal = hours * space.hourly_rate;

  useEffect(() => {
    const loadAddOns = async () => {
      try {
        const { data } = await supabase
          .from('add_ons')
          .select('*')
          .eq('is_active', true)
          .or(`space_id.eq.${space.id},space_id.is.null`);

        if (data) {
          setAddOns(data);
        }
      } catch (err) {
        console.error('Failed to load add-ons:', err);
      }
    };

    loadAddOns();
  }, [space.id]);

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(addOnId)) {
        newMap.delete(addOnId);
      } else {
        newMap.set(addOnId, 1);
      }
      return newMap;
    });
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    try {
      const { data } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (!data) {
        setError('Discount code not found');
        return;
      }

      if (data.current_uses >= data.max_uses) {
        setError('Discount code has reached maximum uses');
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError('Discount code has expired');
        return;
      }

      if (baseTotal < data.min_booking_amount) {
        setError(`Minimum booking amount of $${data.min_booking_amount} required`);
        return;
      }

      if (data.space_id && data.space_id !== space.id) {
        setError('This discount code is not valid for this space');
        return;
      }

      setAppliedDiscount(data);
      setError('');
    } catch (err) {
      console.error('Error applying discount:', err);
      setError('Failed to apply discount code');
    }
  };

  const addOnsTotal = Array.from(selectedAddOns.keys()).reduce((sum, addOnId) => {
    const addOn = addOns.find((a) => a.id === addOnId);
    return sum + (addOn?.price || 0) * (selectedAddOns.get(addOnId) || 1);
  }, 0);

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = ((baseTotal + addOnsTotal) * appliedDiscount.value) / 100;
    } else {
      discountAmount = appliedDiscount.value;
    }
  }

  const subtotal = baseTotal + addOnsTotal;
  const total = subtotal - discountAmount;
  const { data: settingsData } = useState<any>(null);
  const depositPercentage = 50; // default

  const depositAmount = Math.round(total * (depositPercentage / 100) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            space_id: space.id,
            date,
            start_hour: startHour,
            end_hour: endHour,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            etransfer_reference: etransferReference || null,
            total_amount: total,
            deposit_amount: depositAmount,
            discount_code_id: appliedDiscount?.id || null,
            discount_amount: discountAmount,
            status: 'pending',
            payment_verified: false,
            notes: null,
          },
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Add selected add-ons
      if (selectedAddOns.size > 0) {
        const addOnsToInsert = Array.from(selectedAddOns.entries()).map(
          ([addOnId, quantity]) => {
            const addOn = addOns.find((a) => a.id === addOnId);
            return {
              booking_id: bookingData.id,
              add_on_id: addOnId,
              quantity,
              price_at_booking: addOn?.price || 0,
            };
          }
        );

        const { error: addOnsError } = await supabase
          .from('booking_add_ons')
          .insert(addOnsToInsert);

        if (addOnsError) throw addOnsError;
      }

      // Update discount code usage
      if (appliedDiscount) {
        await supabase
          .from('discount_codes')
          .update({ current_uses: appliedDiscount.current_uses + 1 })
          .eq('id', appliedDiscount.id);
      }

      onBookingComplete(bookingData.id);
    } catch (err) {
      console.error('Booking creation failed:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-900">Your Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="input-field"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="input-field"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            required
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="input-field"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      {/* Add-ons */}
      {addOns.length > 0 && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Add-ons</h3>
          {addOns.map((addOn) => (
            <label key={addOn.id} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAddOns.has(addOn.id)}
                onChange={() => handleAddOnToggle(addOn.id)}
                className="checkbox mt-1"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{addOn.name}</p>
                <p className="text-sm text-gray-600">{addOn.description}</p>
                <p className="text-sm font-semibold text-cyan-600 mt-1">
                  ${addOn.price.toFixed(2)}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Discount Code */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-900">Discount Code (Optional)</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            disabled={appliedDiscount !== null}
            className="input-field flex-1"
            placeholder="Enter code"
          />
          {!appliedDiscount && (
            <button
              type="button"
              onClick={handleApplyDiscount}
              className="btn-secondary"
              disabled={loading}
            >
              Apply
            </button>
          )}
          {appliedDiscount && (
            <button
              type="button"
              onClick={() => {
                setAppliedDiscount(null);
                setDiscountCode('');
              }}
              className="btn-secondary"
            >
              Clear
            </button>
          )}
        </div>
        {appliedDiscount && (
          <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
            Code applied: {appliedDiscount.code}
          </div>
        )}
      </div>

      {/* E-transfer Reference */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-900">E-transfer (If Paid)</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-transfer Reference (Optional)
          </label>
          <input
            type="text"
            value={etransferReference}
            onChange={(e) => setEtransferReference(e.target.value)}
            className="input-field"
            placeholder="e.g., TRF-ABC123"
          />
          <p className="text-xs text-gray-500 mt-1">
            If paying by e-transfer, provide the reference number for verification
          </p>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-900">Price Breakdown</h3>

        <div className="space-y-2 border-b border-gray-200 pb-3">
          <div className="flex justify-between text-sm">
            <span>Court Rental ({hours} hours)</span>
            <span className="font-medium">${baseTotal.toFixed(2)}</span>
          </div>
          {addOnsTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span>Add-ons</span>
              <span className="font-medium">${addOnsTotal.toFixed(2)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Discount ({appliedDiscount?.code})</span>
              <span className="font-medium">-${discountAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-900">Deposit Required</p>
          <p className="text-lg font-bold text-cyan-600">${depositAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-600 mt-1">50% of total (due to confirm booking)</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating booking...' : 'Complete Booking'}
      </button>
    </form>
  );
}
