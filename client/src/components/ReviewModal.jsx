import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, role, orderId, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');

  // Role specific ratings
  const [productQuality, setProductQuality] = useState(0);
  const [deliveryExperience, setDeliveryExperience] = useState(0);
  
  const [paymentReliability, setPaymentReliability] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  
  const [communication, setCommunication] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please provide an overall rating");
      return;
    }
    
    setIsSubmitting(true);
    const data = {
      orderId,
      rating,
      title,
      review,
      communication: communication || undefined,
    };

    if (role === 'Buyer') {
      data.productQuality = productQuality || undefined;
      data.deliveryExperience = deliveryExperience || undefined;
    } else if (role === 'Farmer') {
      data.paymentReliability = paymentReliability || undefined;
      data.professionalism = professionalism || undefined;
    }

    await onSubmit(data);
    setIsSubmitting(false);
  };

  const renderStars = (currentRating, setRatingState) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= currentRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
            onClick={() => setRatingState(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-display font-extrabold text-xl text-charcoal dark:text-gray-100">
              {role === 'Buyer' ? 'Review Farmer & Produce' : 'Review Buyer Experience'}
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Order: {orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-50 dark:bg-[#0F172A] text-gray-400 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form id="reviewForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-[#0F172A] rounded-xl">
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Overall Rating *</span>
              <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-transform hover:scale-110 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* Specific Ratings */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detailed Feedback</h4>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-charcoal dark:text-gray-100">Communication</span>
                {renderStars(communication, setCommunication)}
              </div>

              {role === 'Buyer' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal dark:text-gray-100">Produce Quality</span>
                    {renderStars(productQuality, setProductQuality)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal dark:text-gray-100">Delivery Experience</span>
                    {renderStars(deliveryExperience, setDeliveryExperience)}
                  </div>
                </>
              )}

              {role === 'Farmer' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal dark:text-gray-100">Payment Reliability</span>
                    {renderStars(paymentReliability, setPaymentReliability)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal dark:text-gray-100">Professionalism</span>
                    {renderStars(professionalism, setProfessionalism)}
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
              <div>
                <label className="block text-sm font-bold text-charcoal dark:text-gray-100 mb-1.5">Review Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize your experience..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-155 focus:outline-none focus:border-primary/50 text-sm text-charcoal dark:text-gray-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-charcoal dark:text-gray-100 mb-1.5">Detailed Review *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="What did you like or dislike? What should others know?"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-155 focus:outline-none focus:border-primary/50 text-sm text-charcoal dark:text-gray-100 resize-none transition-colors"
                ></textarea>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0F172A] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="reviewForm"
            disabled={isSubmitting || rating === 0}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

