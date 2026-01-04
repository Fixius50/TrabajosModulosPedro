import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useUserProgress } from '../stores/userProgress';
import StarRating from './ui/StarRating';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewsSection({ seriesId }) {
    const { userId, profile } = useUserProgress();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userReview, setUserReview] = useState(null); // Review del usuario actual si existe

    // New Review State
    const [newRating, setNewRating] = useState(0);
    const [newContent, setNewContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [seriesId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            // Join con profiles para sacar nombres/avatar
            // NOTA: Supabase JS a veces requiere configuración explícita de FK en el dashboard para joins automaticos.
            // Si falla, haré fetch separado. Asumimos que la FK está bien.
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    profiles:user_id ( username, avatar_url )
                `)
                .eq('series_id', seriesId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setReviews(data || []);

            // Check if current user reviewed
            if (userId) {
                const myRev = data.find(r => r.user_id === userId);
                setUserReview(myRev || null);
            }

        } catch (err) {
            console.error('Error loading reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return alert('Debes iniciar sesión para opinar.');
        if (newRating === 0) return alert('¡Por favor califica con estrellas!');

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('reviews')
                .insert({
                    series_id: seriesId,
                    user_id: userId,
                    rating: newRating,
                    content: newContent
                });

            if (error) throw error;

            // Reset and Reload
            setNewRating(0);
            setNewContent('');
            fetchReviews();
        } catch (err) {
            alert('Error al publicar: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('¿Borrar tu reseña?')) return;
        try {
            const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
            if (error) throw error;
            fetchReviews();
            setUserReview(null);
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="p-8 text-center opacity-50">Cargando opiniones...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Input Area - Only if user hasn't reviewed yet */}
            {!userReview ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-4 font-mono">Deja tu opinión</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm opacity-70 mb-2">Puntuación</label>
                            <StarRating rating={newRating} setRating={setNewRating} size={32} />
                        </div>

                        <textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="¿Qué te pareció esta historia? Cuéntanos..."
                            className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors min-h-[100px]"
                        />

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !userId}
                                className={`px-6 py-2 rounded-lg font-bold transition-all ${submitting || !userId ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 shadow-lg'}`}
                            >
                                {submitting ? 'Publicando...' : (userId ? 'Publicar Reseña' : 'Inicia Sesión para Opinar')}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl text-center">
                    <p className="text-purple-200">¡Ya has opinado sobre esta historia!</p>
                    <button onClick={() => handleDelete(userReview.id)} className="text-xs text-red-400 hover:text-red-300 underline mt-2">
                        Borrar mi reseña
                    </button>
                </div>
            )}

            {/* List */}
            <div className="space-y-4">
                <h3 className="opacity-50 font-bold uppercase text-sm tracking-wider">
                    {reviews.length} {reviews.length === 1 ? 'Opinión' : 'Opiniones'}
                </h3>

                {reviews.length === 0 && (
                    <div className="text-center py-10 opacity-30 text-3xl font-black grayscale">
                        SÉ EL PRIMERO
                    </div>
                )}

                {reviews.map(review => (
                    <ReviewItem key={review.id} review={review} currentUserId={userId} onDelete={handleDelete} />
                ))}
            </div>
        </div>
    );
}

// Subcomponente para cada item (Maneja sus comentarios)
function ReviewItem({ review, currentUserId, onDelete }) {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // Reply Form
    const [replyContent, setReplyContent] = useState('');
    const [replying, setReplying] = useState(false);

    const toggleComments = async () => {
        if (!showComments && comments.length === 0) {
            await fetchComments();
        }
        setShowComments(!showComments);
    };

    const fetchComments = async () => {
        setLoadingComments(true);
        const { data } = await supabase
            .from('review_comments')
            .select(`
                *,
                profiles:user_id ( username, avatar_url )
            `)
            .eq('review_id', review.id)
            .order('created_at', { ascending: true }); // Oldest first for threads

        setComments(data || []);
        setLoadingComments(false);
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        setReplying(true);

        const { error } = await supabase.from('review_comments').insert({
            review_id: review.id,
            user_id: currentUserId,
            content: replyContent
        });

        if (!error) {
            setReplyContent('');
            fetchComments(); // Refresh
        }
        setReplying(false);
    };

    const isMine = currentUserId === review.user_id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden">
                        {review.profiles?.avatar_url ? (
                            <img src={review.profiles.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                            review.profiles?.username?.[0]?.toUpperCase() || '?'
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                            {review.profiles?.username || 'Usuario Desconocido'}
                            {isMine && <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1 rounded">TÚ</span>}
                        </div>
                        <div className="text-xs opacity-40">
                            {new Date(review.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <StarRating rating={review.rating} readOnly size={16} />
            </div>

            {/* Content */}
            <p className="text-gray-300 leading-relaxed text-sm mb-4">
                {review.content}
            </p>

            {/* Actions Bar */}
            <div className="flex items-center gap-4 border-t border-white/5 pt-3">
                <button
                    onClick={toggleComments}
                    className="flex items-center gap-2 text-xs font-bold opacity-60 hover:opacity-100 hover:text-purple-400 transition-all"
                >
                    💬 Comentarios {comments.length > 0 && `(${comments.length})`}
                </button>

                {isMine && (
                    <button onClick={() => onDelete(review.id)} className="text-xs text-red-500/50 hover:text-red-500 transition-colors">
                        Eliminar
                    </button>
                )}
            </div>

            {/* Comments Thread */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pl-4 border-l-2 border-white/10 space-y-4">
                            {loadingComments ? (
                                <div className="text-xs opacity-50 py-2">Cargando hilo...</div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="bg-black/20 p-3 rounded-lg text-sm">
                                        <div className="flex justify-between text-xs opacity-50 mb-1">
                                            <span className="font-bold text-base text-purple-300">{comment.profiles?.username}</span>
                                            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="opacity-80">{comment.content}</p>
                                    </div>
                                ))
                            )}

                            {/* Reply Box */}
                            {currentUserId ? (
                                <form onSubmit={handleReply} className="pt-2 flex gap-2">
                                    <input
                                        type="text"
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Responder..."
                                        className="flex-1 bg-transparent border-b border-white/20 focus:border-purple-500 outline-none text-sm py-1 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!replyContent}
                                        className="text-xs font-bold text-purple-400 disabled:opacity-30 uppercase"
                                    >
                                        {replying ? '...' : 'Enviar'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-xs opacity-50 italic">Inicia sesión para responder.</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
