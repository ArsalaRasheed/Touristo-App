import React, { useCallback, useEffect, useState } from 'react';
import {
  Star,
  MessageSquare,
  Pencil,
  Trash2,
  Send,
  Loader2,
  CheckCircle,
  X,
} from 'lucide-react';

const ReviewManager = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('touristo_token');

  const getAuthHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [token]);

  const loadReviewData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [bookingsResponse, reviewsResponse] = await Promise.all([
        fetch(`/api/bookings/user/${userId}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`/api/reviews/user/${userId}`, {
          headers: getAuthHeaders(),
        }),
      ]);

      if (!bookingsResponse.ok) {
        throw new Error('Failed to load your bookings');
      }

      if (!reviewsResponse.ok) {
        throw new Error('Failed to load your reviews');
      }

      const bookingsData = await bookingsResponse.json();
      const reviewsData = await reviewsResponse.json();

      const bookingList =
        bookingsData?.data?.bookings ||
        bookingsData?.bookings ||
        [];

      const reviewList =
        reviewsData?.data?.reviews ||
        reviewsData?.reviews ||
        [];

      setBookings(Array.isArray(bookingList) ? bookingList : []);
      setReviews(Array.isArray(reviewList) ? reviewList : []);
    } catch (err) {
      console.error('Error loading review data:', err);
      setError(err.message || 'Failed to load review data');
    } finally {
      setLoading(false);
    }
  }, [userId, getAuthHeaders]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!userId) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [bookingsResponse, reviewsResponse] = await Promise.all([
          fetch(`/api/bookings/user/${userId}`, {
            headers: getAuthHeaders(),
          }),
          fetch(`/api/reviews/user/${userId}`, {
            headers: getAuthHeaders(),
          }),
        ]);

        if (!bookingsResponse.ok) {
          throw new Error('Failed to load your bookings');
        }

        if (!reviewsResponse.ok) {
          throw new Error('Failed to load your reviews');
        }

        const bookingsData = await bookingsResponse.json();
        const reviewsData = await reviewsResponse.json();

        if (!isMounted) return;

        const bookingList =
          bookingsData?.data?.bookings ||
          bookingsData?.bookings ||
          [];

        const reviewList =
          reviewsData?.data?.reviews ||
          reviewsData?.reviews ||
          [];

        setBookings(Array.isArray(bookingList) ? bookingList : []);
        setReviews(Array.isArray(reviewList) ? reviewList : []);
      } catch (err) {
        if (!isMounted) return;

        console.error('Error loading review data:', err);
        setError(err.message || 'Failed to load review data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId, getAuthHeaders]);

  const isCompletedBooking = (booking) => {
    const cancelledStatuses = [
      'cancelled',
      'canceled',
      'rejected',
      'declined',
    ];

    if (
      booking.status &&
      cancelledStatuses.includes(String(booking.status).toLowerCase())
    ) {
      return false;
    }

    if (!booking.end_date) {
      return false;
    }

    return new Date(booking.end_date) <= new Date();
  };

  const reviewedPackageIds = new Set(
    reviews.map((review) => Number(review.package_id))
  );

  const completedBookings = bookings.filter(isCompletedBooking);

  const reviewableBookings = completedBookings.filter(
    (booking) => !reviewedPackageIds.has(Number(booking.package_id))
  );

  const getPackageTitle = (packageId) => {
    const booking = bookings.find(
      (item) => Number(item.package_id) === Number(packageId)
    );

    return (
      booking?.package_title ||
      booking?.title ||
      `Package #${packageId}`
    );
  };

  const getPackageImage = (packageId) => {
    const booking = bookings.find(
      (item) => Number(item.package_id) === Number(packageId)
    );

    return booking?.package_image || booking?.image || null;
  };

  const startReview = (booking) => {
    setSelectedPackage(booking);
    setEditingReview(null);
    setRating(0);
    setComment('');
    setMessage('');
    setError('');
  };

  const startEdit = (review) => {
    setEditingReview(review);
    setSelectedPackage(null);
    setRating(Number(review.rating) || 0);
    setComment(review.comment || '');
    setMessage('');
    setError('');
  };

  const cancelForm = () => {
    setSelectedPackage(null);
    setEditingReview(null);
    setRating(0);
    setComment('');
    setMessage('');
    setError('');
  };

  const submitReview = async (event) => {
    event.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating from 1 to 5 stars.');
      return;
    }

    if (comment.length > 1000) {
      setError('Review cannot be longer than 1000 characters.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const isEditing = Boolean(editingReview);

      const url = isEditing
        ? `/api/reviews/${editingReview.id}`
        : '/api/reviews';

      const method = isEditing ? 'PATCH' : 'POST';

      const body = {
        rating: Number(rating),
        comment: comment.trim(),
      };

      if (!isEditing && selectedPackage) {
        body.package_id = Number(selectedPackage.package_id);
      }

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to submit review'
        );
      }

      setMessage(
        isEditing
          ? 'Your review has been updated successfully.'
          : 'Your review has been submitted successfully.'
      );

      setSelectedPackage(null);
      setEditingReview(null);
      setRating(0);
      setComment('');

      await loadReviewData();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Unable to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this review?'
    );

    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to delete review'
        );
      }

      setMessage('Your review has been deleted successfully.');

      if (editingReview?.id === reviewId) {
        cancelForm();
      }

      await loadReviewData();
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(err.message || 'Unable to delete review.');
    }
  };

  const renderStars = (
    currentRating,
    clickable = false,
    onSelect = null
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onSelect?.(star)}
            className={`transition ${
              clickable
                ? 'cursor-pointer hover:scale-110'
                : 'cursor-default'
            }`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`w-7 h-7 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-6 border border-[color:var(--border-primary)] shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-7 h-7 animate-spin text-[color:var(--accent-primary)]" />
          <span className="ml-3 text-[color:var(--text-secondary)]">
            Loading your reviews...
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-6 border border-[color:var(--border-primary)] shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-[color:var(--surface-secondary)] flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-[color:var(--accent-primary)]" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[color:var(--text-primary)]">
            Reviews & Ratings
          </h2>

          <p className="text-sm text-[color:var(--text-secondary)]">
            Share your experience from completed trips
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-green-50 border border-green-200 text-green-800">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{message}</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <X className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {(selectedPackage || editingReview) && (
        <form
          onSubmit={submitReview}
          className="mb-6 p-5 rounded-xl bg-[color:var(--surface-secondary)] border border-[color:var(--border-primary)]"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-bold text-[color:var(--text-primary)]">
                {editingReview
                  ? 'Edit Your Review'
                  : 'Write a Review'}
              </h3>

              <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                {editingReview
                  ? getPackageTitle(editingReview.package_id)
                  : selectedPackage
                    ? selectedPackage.package_title ||
                      selectedPackage.title ||
                      `Package #${selectedPackage.package_id}`
                    : ''}
              </p>
            </div>

            <button
              type="button"
              onClick={cancelForm}
              className="p-2 rounded-lg hover:bg-[color:var(--border-primary)] transition"
              aria-label="Close review form"
            >
              <X className="w-5 h-5 text-[color:var(--text-secondary)]" />
            </button>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-[color:var(--text-primary)] mb-2">
              Your Rating
            </label>

            {renderStars(
              rating,
              true,
              (selectedRating) => setRating(selectedRating)
            )}
          </div>

          <div className="mb-5">
            <label
              htmlFor="review-comment"
              className="block text-sm font-semibold text-[color:var(--text-primary)] mb-2"
            >
              Your Review
              <span className="font-normal text-[color:var(--text-secondary)]">
                {' '}
                (optional)
              </span>
            </label>

            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Tell other travelers about your experience..."
              rows={4}
              maxLength={1000}
              className="w-full rounded-xl border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)] p-3 outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] resize-none"
            />

            <div className="flex justify-end mt-1">
              <span className="text-xs text-[color:var(--text-secondary)]">
                {comment.length}/1000
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !rating}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] font-semibold hover:bg-[color:var(--accent-primary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {editingReview ? 'Update Review' : 'Submit Review'}
              </>
            )}
          </button>
        </form>
      )}

      <div className="mb-7">
        <h3 className="text-lg font-bold text-[color:var(--text-primary)] mb-3">
          Trips Available for Review
        </h3>

        {reviewableBookings.length === 0 ? (
          <div className="p-5 rounded-xl bg-[color:var(--surface-secondary)] text-center">
            <p className="text-[color:var(--text-secondary)] text-sm">
              No completed trips are waiting for a review.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewableBookings.map((booking) => {
              const image = getPackageImage(booking.package_id);

              return (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[color:var(--surface-secondary)] border border-[color:var(--border-primary)]"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {image ? (
                      <img
                        src={image}
                        alt={
                          booking.package_title ||
                          booking.title ||
                          'Tour package'
                        }
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[color:var(--accent-primary)]/10 flex items-center justify-center shrink-0">
                        <Star className="w-7 h-7 text-[color:var(--accent-primary)]" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="font-semibold text-[color:var(--text-primary)] truncate">
                        {booking.package_title ||
                          booking.title ||
                          `Package #${booking.package_id}`}
                      </h4>

                      {booking.destination_name && (
                        <p className="text-sm text-[color:var(--text-secondary)]">
                          {booking.destination_name}
                        </p>
                      )}

                      {booking.end_date && (
                        <p className="text-xs text-[color:var(--text-secondary)] mt-1">
                          Completed{' '}
                          {new Date(
                            booking.end_date
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => startReview(booking)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] font-medium hover:bg-[color:var(--accent-primary-hover)] transition shrink-0"
                  >
                    <Star className="w-4 h-4" />
                    Write Review
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-[color:var(--text-primary)] mb-3">
          Your Reviews
        </h3>

        {reviews.length === 0 ? (
          <div className="p-5 rounded-xl bg-[color:var(--surface-secondary)] text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-[color:var(--text-secondary)]" />

            <p className="text-[color:var(--text-secondary)] text-sm">
              You haven't written any reviews yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-5 rounded-xl bg-[color:var(--surface-secondary)] border border-[color:var(--border-primary)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-[color:var(--text-primary)] mb-2">
                      {getPackageTitle(review.package_id)}
                    </h4>

                    {renderStars(Number(review.rating) || 0)}

                    {review.comment && (
                      <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                        {review.comment}
                      </p>
                    )}

                    {review.created_at && (
                      <p className="mt-3 text-xs text-[color:var(--text-secondary)]">
                        {new Date(
                          review.created_at
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(review)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)] border border-[color:var(--border-primary)] hover:bg-[color:var(--border-primary)] transition text-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteReview(review.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewManager;