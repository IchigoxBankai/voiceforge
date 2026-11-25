import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!supabaseAdmin || req.user?.isGuest) {
      return res.json({ success: true, projects: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*, generations(count)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      logger.warn(`Could not query projects table: ${error.message}`);
      return res.json({ success: true, projects: [] });
    }

    res.json({
      success: true,
      projects: data || []
    });
  } catch (err) {
    logger.warn(`Projects controller catch: ${err.message}`);
    res.json({ success: true, projects: [] });
  }
};

export const createProject = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { name, description, projectType = 'tts' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Project name is required' }
      });
    }

    if (!supabaseAdmin || req.user?.isGuest) {
      return res.status(201).json({
        success: true,
        project: {
          id: `proj_${Date.now()}`,
          name: name.trim(),
          description: description?.trim() || null,
          project_type: projectType,
          created_at: new Date().toISOString()
        }
      });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        project_type: projectType
      })
      .select()
      .single();

    if (error) {
      logger.warn(`Project insert error: ${error.message}`);
      return res.status(201).json({
        success: true,
        project: {
          id: `proj_${Date.now()}`,
          name: name.trim(),
          description: description?.trim() || null,
          project_type: projectType,
          created_at: new Date().toISOString()
        }
      });
    }

    res.status(201).json({
      success: true,
      project: data
    });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, description } = req.body;

    if (!supabaseAdmin || req.user?.isGuest) {
      return res.json({ success: true, project: { id, name, description } });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description;

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.warn(`Project update error: ${error.message}`);
    }

    res.json({
      success: true,
      project: data || { id, name, description }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!supabaseAdmin || req.user?.isGuest) {
      return res.json({ success: true, message: 'Deleted' });
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.warn(`Project delete error: ${error.message}`);
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
