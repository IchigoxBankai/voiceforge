import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Trash2, Edit2, Check, ArrowRight, AudioWaveform, Globe } from 'lucide-react';
import { api } from '../services/api';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectType, setProjectType] = useState('tts');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (res.projects) setProjects(res.projects);
    } catch (err) {
      console.warn('Projects fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      const res = await api.post('/projects', {
        name: projectName.trim(),
        description: projectDescription.trim(),
        projectType
      });
      if (res.project) {
        setProjects([res.project, ...projects]);
        setShowModal(false);
        setProjectName('');
        setProjectDescription('');
      }
    } catch (err) {
      setError(err.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project workspace?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-[#3a5d61] pb-4 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#DFD6AE] mb-1">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>ORGANIZATION & WORKSPACES</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Projects</h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-[#DFD6AE] hover:bg-[#ebe4c5] text-black font-semibold text-xs font-mono flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(223,214,174,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="lattice-panel p-5 rounded-xl border border-[#3a5d61] animate-pulse h-36" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div key={p.id} className="lattice-panel p-5 rounded-xl border border-[#3a5d61] flex flex-col justify-between group hover:border-[#497176] transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21383b] border border-[#3a5d61] text-[#b5ad8c] uppercase">
                    {p.project_type}
                  </span>
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="text-[#7c9496] hover:text-red-400 transition-colors p-1"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#ebe4c5] transition-colors">
                  {p.name}
                </h3>
                <p className="mt-1 text-xs text-[#b5ad8c] line-clamp-2 leading-relaxed">
                  {p.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#3a5d61]/60 flex items-center justify-between text-xs font-mono text-[#9ab0b2]">
                <span>{new Date(p.created_at).toLocaleDateString()}</span>
                <span className="text-[#DFD6AE] text-[11px] font-sans">Active Workspace</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="lattice-panel p-12 rounded-2xl border border-[#3a5d61] text-center space-y-3">
          <FolderKanban className="w-8 h-8 text-[#7c9496] mx-auto" />
          <h3 className="text-sm font-semibold text-[#dfd8bc]">No project workspaces yet</h3>
          <p className="text-xs text-[#9ab0b2]">Create a workspace to group your audio synthesis and translations.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#DFD6AE]/20 text-[#ebe4c5] text-xs font-mono border border-[#DFD6AE]/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Project</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="lattice-panel p-6 rounded-2xl border border-[#DFD6AE]/20 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white font-mono">Create New Workspace</h3>

            {error && <div className="text-xs text-red-400">{error}</div>}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#b5ad8c] mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Global Podcast Series"
                  className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg px-3 py-2 text-xs text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#b5ad8c] mb-1">Project Type</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg px-3 py-2 text-xs font-mono text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE]"
                >
                  <option value="tts">Text-to-Speech Focus</option>
                  <option value="translation">Speech Translation Focus</option>
                  <option value="multi">Multilingual Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#b5ad8c] mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Workspace notes and objectives..."
                  className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg p-2.5 text-xs text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE] resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#3a5d61] text-xs font-mono text-[#b5ad8c] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#DFD6AE] hover:bg-[#ebe4c5] text-black font-semibold text-xs font-mono"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

