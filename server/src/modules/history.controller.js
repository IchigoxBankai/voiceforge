import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { type, search, sort = 'desc' } = req.query;

    if (!supabaseAdmin || req.user?.isGuest) {
      return res.json({ success: true, history: [], total: 0 });
    }

    let query = supabaseAdmin
      .from('generations')
      .select('*, project:project_id(id, name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: sort === 'asc' });

    if (type && type !== 'all') {
      query = query.eq('generation_type', type);
    }

    if (search && search.trim()) {
      query = query.ilike('input_text', `%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
      logger.warn(`Could not query history table: ${error.message}`);
      return res.json({ success: true, history: [], total: 0 });
    }

    res.json({
      success: true,
      history: data || [],
      total: data?.length || 0
    });
  } catch (err) {
    logger.warn(`History controller catch: ${err.message}`);
    res.json({ success: true, history: [], total: 0 });
  }
};

export const deleteHistoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!supabaseAdmin || req.user?.isGuest) {
      return res.json({ success: true, message: 'Deleted' });
    }

    const { error } = await supabaseAdmin
      .from('generations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.warn(`Delete history item error: ${error.message}`);
    }

    res.json({
      success: true,
      message: 'History record deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
