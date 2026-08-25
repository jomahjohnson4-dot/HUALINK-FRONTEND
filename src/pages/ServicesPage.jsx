import { useState } from 'react';
import ServiceContactModal from '../components/modals/ServiceContactModal';

export default function BookingsList({ bookings = [] }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenContact = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-4">
      {bookings.length === 0 ? (
        <p className="text-xs text-slate-400">No bookings available.</p>
      ) : (
        bookings.map((booking) => (
          <div 
            key={booking._id || booking.id} 
            className="p-4 bg-slate-800 border border-slate-700/60 rounded-xl flex justify-between items-center"
          >
            <div>
              <h3 className="text-white font-bold text-sm">
                {booking.serviceTitle || 'Service Request'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {booking.clientName || 'Client'}
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => handleOpenContact(booking)}
              className="bg-orange-500 hover:bg-orange-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Contact Provider
            </button>
          </div>
        ))
      )}

      {/* Render Contact Modal */}
      {isModalOpen && (
        <ServiceContactModal
          booking={selectedBooking}
          providerPhone={selectedBooking?.clientPhone || '255700000000'}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}